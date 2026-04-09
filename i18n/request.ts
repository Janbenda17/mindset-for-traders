import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from header set by middleware
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'cs';
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
