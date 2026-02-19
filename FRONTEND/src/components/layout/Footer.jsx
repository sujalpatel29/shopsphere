import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

function Footer() {
  return (
    <footer className="mt-auto border-t border-amber-200/70 bg-[#fff8ee] text-gray-900 dark:border-[#1f2933] dark:bg-[#151e22] dark:text-slate-200 pb-20">
      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 py-4 md:grid-cols-4 md:px-8 lg:px-12">
        <div className="md:col-span-2">
          <h3 className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight">
            <img src="/logo.svg" alt="ShopSphere" className="h-5 w-5" />
            ShopSphere
          </h3>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-600 dark:text-slate-400">
            Curated products across electronics, fashion, gaming, and home
            appliances. Experience premium shopping with us.
          </p>
        </div>

        <div>
          <h4 className="font-accent text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 dark:text-amber-500">
            Social
          </h4>
          <div className="mt-2 flex gap-4 text-xs text-gray-600 dark:text-slate-400">
            <a
              className="transition hover:text-amber-600 dark:hover:text-amber-300"
              href="#"
            >
              Instagram
            </a>
            <a
              className="transition hover:text-amber-600 dark:hover:text-amber-300"
              href="#"
            >
              Pinterest
            </a>
            <a
              className="transition hover:text-amber-600 dark:hover:text-amber-300"
              href="#"
            >
              LinkedIn
            </a>
            <a
              className="transition hover:text-amber-600 dark:hover:text-amber-300"
              href="#"
            >
              Twitter
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-accent text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 dark:text-amber-500">
            Newsletter
          </h4>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            Subscribe for distinct updates.
          </p>
          <div className="mt-2 flex gap-2 max-w-[200px]">
            <InputText
              placeholder="Email"
              className="w-full !rounded-md border border-amber-200 bg-white/50 !px-2 !py-1 !text-[10px] text-gray-900 placeholder:text-gray-400 focus:border-amber-600 focus:ring-0 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <Button
              type="button"
              label="Join"
              className="font-accent !rounded-md !bg-amber-600 !px-3 !py-1 !text-[10px] !font-medium !text-white !shadow-sm hover:!bg-amber-700"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-amber-200/50 bg-[#fff8ee] py-2 text-center text-[10px] text-gray-500 dark:border-slate-800 dark:bg-[#151e22] dark:text-slate-500">
        &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
