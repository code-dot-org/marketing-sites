import {useMemo} from 'react';

import {ButtonProps, LinkButton} from '@/button';
import Image, {ImageProps} from '@/cms/image';
import Tabs, {TabModel, TabsProps} from '@/tabs';
import {BodyThreeText, Heading3} from '@/typography';

export interface TabGroupTabModel extends Omit<TabModel, 'tabContent'> {
  tabContent: {
    image: ImageProps;
    button: ButtonProps;
    title: string;
    description: string;
  };
}
export interface TabGroupProps extends Omit<TabsProps, 'tabs'> {
  /** Array of props for Tabs to render */
  tabs: (TabModel | TabGroupTabModel)[];
  /** The function that is called when a Tab is clicked/selected tab is changed */
  onChange: (value: string) => void;
  /** The name attribute specifies the name of a Tabs group.
     The name attribute is used to reference elements in a JavaScript.
     */
  name: string;
  /** The value of the default selected Tab. Also can be used to change Selected tab from Consumer(Parent Component) */
  defaultSelectedTabValue: string;
}

const isTabGroupTabModel = (
  tab: TabModel | TabGroupTabModel,
): tab is TabGroupTabModel =>
  (tab as TabGroupTabModel).tabContent?.image !== undefined;

const parseTabsGroupTabToRegularTab = (tab: TabGroupTabModel | TabModel) => {
  if (isTabGroupTabModel(tab)) {
    return {
      ...tab,
      tabContent: (
        <div>
          <Image {...tab.tabContent.image} />
          <Heading3>{tab.tabContent.title}</Heading3>
          <BodyThreeText>{tab.tabContent.description}</BodyThreeText>
          <LinkButton {...tab.tabContent.button} />
        </div>
      ),
    };
  } else {
    return tab; // No need to modify if it's a standard TabModel
  }
};

const TabGroup: React.FunctionComponent<TabGroupProps> = ({
  tabs,
  onChange,
  defaultSelectedTabValue,
  name,
  ...rest
}) => {
  const parsedTabs = useMemo(
    () => tabs.map(parseTabsGroupTabToRegularTab),
    [tabs],
  );

  return (
    <Tabs
      tabs={parsedTabs}
      onChange={onChange}
      defaultSelectedTabValue={defaultSelectedTabValue}
      name={name}
      size="m"
      // type="tabGroup"
      {...rest}
    />
  );
};

export default TabGroup;
