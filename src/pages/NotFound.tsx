import { Link } from 'react-router';
import { buildNotFoundJsonLd, buildNotFoundSeoMeta } from '../lib/seo';
import { useSEO } from '../hooks/useSEO';

export default function NotFound() {
  useSEO(buildNotFoundSeoMeta(), buildNotFoundJsonLd(), 'noindex, follow');

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-2xl font-semibold text-white tracking-tight">Tool not found</h1>
      <p className="text-sm text-neutral-600 mt-1.5 max-w-sm">
        The tool you&rsquo;re looking for doesn&rsquo;t exist. It may have been renamed or removed.
      </p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
      >
        Back to DevChest
      </Link>
    </div>
  );
}
