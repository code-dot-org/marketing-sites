export const updateUrlParams = (url: string, params: object): string => {
  const [baseURL, urlQuery = ''] = url.split('?');

  const urlParams = new URLSearchParams(urlQuery);
  Object.entries(params).forEach(([key, value]) => {
    urlParams.set(key, value);
  });

  return `${baseURL}?${urlParams.toString()}`;
};

export const forceAVIFFormat = (src: string): string =>
  updateUrlParams(src, {fm: 'avif'});
