import {
  ComponentPropertyValue,
  ComponentTreeNode,
  ExperienceEntry,
  ExperienceUnboundValues,
} from '@contentful/experiences-core/types';
import {
  detachExperienceStyles,
  Experience,
} from '@contentful/experiences-sdk-react';

type Variables = Record<string, ComponentPropertyValue>;
type SetOverwrite = (key: string, value: ComponentPropertyValue) => void;

// Prefix for the keys that carry a binding from a pattern instance into a
// pattern nested inside it.
const FORWARD_KEY_PREFIX = 'prebindingBackground-';

const isBackgroundImageVariable = (name: string) =>
  name === 'cfBackgroundImageUrl' || name.startsWith('cfBackgroundImageUrl_');

const walk = (
  nodes: ComponentTreeNode[],
  visit: (node: ComponentTreeNode) => void,
) => {
  for (const node of nodes) {
    visit(node);
    walk(node.children, visit);
  }
};

/** Pattern variable keys that feed a background image in the pattern's tree. */
const getBackgroundImageKeys = (pattern: ExperienceEntry) => {
  const keys = new Set<string>();
  walk(pattern.fields.componentTree.children, node => {
    for (const [name, value] of Object.entries(node.variables)) {
      if (isBackgroundImageVariable(name) && value.type === 'ComponentValue') {
        keys.add(value.key);
      }
    }
  });
  return keys;
};

/**
 * `detachExperienceStyles`, plus container background images bound through a
 * pattern's content type binding (prebinding).
 *
 * The SDK (3.8.10) builds the SSR stylesheet from the values set on pattern
 * instances and never reads prebinding, so these background images are left
 * out. Delivery uses the SSR class names, so they never render. Studio
 * resolves them in the browser, which is why they show there.
 *
 * This sets each prebound background image as a bound value on the pattern
 * instance, runs the SDK, then removes those values. Only the generated class
 * names stay in the experience sent to the client.
 *
 * TODO: remove once the SDK resolves prebinding in detachExperienceStyles.
 */
export function detachExperienceStylesWithPrebinding(experience: Experience) {
  const entityStore = experience.entityStore;
  const pageTree = entityStore?.experienceEntryFields?.componentTree;
  if (!entityStore || !pageTree || entityStore.isExperienceAPatternEntry) {
    return detachExperienceStyles(experience);
  }

  const patternsById = new Map(
    entityStore.usedComponents.map(pattern => [pattern.sys.id, pattern]),
  );
  const changes: {
    variables: Variables;
    key: string;
    original?: ComponentPropertyValue;
  }[] = [];
  /** Sets the variable unless an author gave it a value. Returns whether it's set. */
  const setVariable = (
    variables: Variables,
    key: string,
    value: ComponentPropertyValue,
    unboundValues: ExperienceUnboundValues = {},
  ) => {
    const original = variables[key];
    // Studio stores an empty unbound value for a variable nobody filled in.
    const isUnset =
      !original ||
      (original.type === 'UnboundValue' &&
        unboundValues[original.key]?.value === undefined);
    if (!isUnset) return false;

    changes.push({variables, key, original});
    variables[key] = value;
    return true;
  };

  const getContentTypeId = (dataSourceKey: string) => {
    const link = entityStore.dataSource[dataSourceKey];
    const entity = link
      ? entityStore.entities.find(e => e.sys.id === link.sys.id)
      : undefined;
    return entity?.sys.type === 'Entry'
      ? entity.sys.contentType.sys.id
      : undefined;
  };

  const applyParameter = (
    pattern: ExperienceEntry,
    parameterId: string,
    dataSourceKey: string,
    contentTypeId: string,
    setOverwrite: SetOverwrite,
  ) => {
    const backgroundImageKeys = getBackgroundImageKeys(pattern);

    for (const prebinding of pattern.fields.componentSettings
      ?.prebindingDefinitions ?? []) {
      for (const [key, mapping] of Object.entries(
        prebinding.variableMappings ?? {},
      )) {
        const path =
          mapping.parameterId === parameterId && backgroundImageKeys.has(key)
            ? mapping.pathsByContentType[contentTypeId]?.path
            : undefined;
        if (path) {
          setOverwrite(key, {
            type: 'BoundValue',
            path: `/${dataSourceKey}${path}`,
          });
        }
      }

      // A parameter passed into a nested pattern: route the nested pattern's
      // variable to a key on this pattern, which the outer instance then sets.
      const passToNodes =
        prebinding.parameterDefinitions[parameterId]?.passToNodes ?? [];
      for (const target of passToNodes) {
        let node: ComponentTreeNode | undefined;
        walk(pattern.fields.componentTree.children, candidate => {
          if (candidate.id === target.nodeId) node = candidate;
        });
        const nestedPattern = node && patternsById.get(node.definitionId);
        if (!node || !nestedPattern) continue;

        const nestedNode = node;
        applyParameter(
          nestedPattern,
          target.parameterId,
          dataSourceKey,
          contentTypeId,
          (key, value) => {
            // Studio usually exposes it already as a variable of this pattern.
            const existing = nestedNode.variables[key];
            if (existing?.type === 'ComponentValue') {
              setOverwrite(existing.key, value);
              return;
            }

            const forwardKey = `${FORWARD_KEY_PREFIX}${nestedNode.id}-${key}`;
            const isForwarded = setVariable(
              nestedNode.variables,
              key,
              {type: 'ComponentValue', key: forwardKey},
              pattern.fields.unboundValues,
            );
            if (isForwarded) setOverwrite(forwardKey, value);
          },
        );
      }
    }
  };

  walk(pageTree.children, node => {
    const pattern = patternsById.get(node.definitionId);
    if (!pattern || !node.parameters) return;

    for (const [parameterId, parameter] of Object.entries(node.parameters)) {
      const [, dataSourceKey] = parameter.path.split('/');
      const contentTypeId = getContentTypeId(dataSourceKey);
      if (!contentTypeId) continue;

      applyParameter(
        pattern,
        parameterId,
        dataSourceKey,
        contentTypeId,
        (key, value) =>
          setVariable(node.variables, key, value, entityStore.unboundValues),
      );
    }
  });

  try {
    return detachExperienceStyles(experience);
  } finally {
    for (const {variables, key, original} of changes.reverse()) {
      if (original) variables[key] = original;
      else delete variables[key];
    }
  }
}
