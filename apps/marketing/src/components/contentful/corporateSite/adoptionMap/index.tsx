// Export the Component Definition for use in Contentful Studio
import {Suspense} from 'react';

export {AdoptionMapContentfulComponentDefinition} from './AdoptionMapContentfulDefinition';
import AdoptionMap from './AdoptionMap';

const AdoptionMapSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdoptionMap />
    </Suspense>
  );
};

export default AdoptionMapSuspense;
