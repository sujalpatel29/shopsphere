import { Link, useLocation } from "react-router-dom";

const aboutLinks = [
  { label: "Contact Us", href: "/info/contact" },
  { label: "About Us", href: "/info/about" },
];

const helpLinks = [
  { label: "Payments", href: "/info/payments" },
  { label: "Shipping", href: "/info/shipping" },
  { label: "Cancellation & Returns", href: "/info/returns" },
  { label: "FAQ", href: "/dashboard?tab=support" },
];

const policyLinks = [
  { label: "Terms Of Use", href: "/info/terms" },
  { label: "Security", href: "/info/security" },
  { label: "Privacy", href: "/info/privacy" },
];

function isFooterLinkActive(href, pathname, search) {
  const [targetPath, targetQueryString = ""] = href.split("?");
  if (pathname !== targetPath) return false;

  if (!targetQueryString) return true;

  const targetParams = new URLSearchParams(targetQueryString);
  const currentParams = new URLSearchParams(search);

  for (const [key, value] of targetParams.entries()) {
    if (currentParams.get(key) !== value) return false;
  }

  return true;
}

function FooterNavLink({ href, label, pathname, search }) {
  const isActive = isFooterLinkActive(href, pathname, search);

  if (isActive) {
    return (
      <span
        aria-current="page"
        className="cursor-default text-sm font-medium text-gray-900 dark:text-slate-200"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      to={href}
      className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
    >
      {label}
    </Link>
  );
}

function Footer() {
  const { pathname, search } = useLocation();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-900 dark:border-[#1f2933] dark:bg-[#151e22] dark:text-slate-200">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8 lg:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
            >
              <img src="/logo.svg" alt="ShopSphere" className="h-6 w-6" />
              ShopSphere
            </Link>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              Curated products across electronics, fashion, gaming, and home
              appliances. Experience premium shopping with us.
            </p>
          </div>

          <div className="pt-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              About
            </h4>
            <ul className="mt-3 space-y-2">
              {aboutLinks.map((item) => (
                <li key={item.label}>
                  <FooterNavLink
                    href={item.href}
                    label={item.label}
                    pathname={pathname}
                    search={search}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Help
            </h4>
            <ul className="mt-3 space-y-2">
              {helpLinks.map((item) => (
                <li key={item.label}>
                  <FooterNavLink
                    href={item.href}
                    label={item.label}
                    pathname={pathname}
                    search={search}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Consumer Policy
            </h4>
            <ul className="mt-3 space-y-2">
              {policyLinks.map((item) => (
                <li key={item.label}>
                  <FooterNavLink
                    href={item.href}
                    label={item.label}
                    pathname={pathname}
                    search={search}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 py-4 text-center text-xs text-gray-500 dark:border-[#1f2933] dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
