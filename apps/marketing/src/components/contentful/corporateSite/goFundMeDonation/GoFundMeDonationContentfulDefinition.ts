import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const GoFundMeDonationContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'goFundMeDonation',
    name: 'GoFundMe Donation',
    category: '08: Advanced',
    tooltip: {
      description:
        'Embeds a GoFundMe donation checkout form. Bind both fields from a "GoFundMe Form" content type entry — manual values are not accepted.',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    variables: {
      formDivId: {
        displayName: 'Form Div ID',
        type: 'Text',
        group: 'content',
        description:
          'Bind to the Form Div ID field of a GoFundMe Form entry (the id from the GoFundMe-provided embed div).',
        validations: {
          bindingSourceType: ['entry'],
        },
      },
      formClassyId: {
        displayName: 'Classy Campaign ID',
        type: 'Text',
        group: 'content',
        description:
          'Bind to the Classy Campaign ID field of a GoFundMe Form entry (the numeric classy attribute value).',
        validations: {
          bindingSourceType: ['entry'],
        },
      },
    },
  };
