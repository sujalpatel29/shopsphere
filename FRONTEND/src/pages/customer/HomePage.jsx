import { Link } from "react-router-dom";
import { Carousel } from "primereact/carousel";
import SmartImage from "../../components/common/SmartImage";

function HomePage() {
  const newArrivals = [];
  const featuredCategories = [];

  const responsiveOptions = [
    { breakpoint: "1200px", numVisible: 3, numScroll: 1 },
    { breakpoint: "992px", numVisible: 2, numScroll: 1 },
    { breakpoint: "576px", numVisible: 1, numScroll: 1 },
  ];

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-white p-10 dark:bg-[#151e22] md:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,119,6,0.12),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(11,17,20,0.4),transparent_40%)] dark:opacity-70" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-accent text-sm uppercase tracking-[0.2em] text-amber-600">
              New Collection 2026
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-gray-900 dark:text-slate-100 md:text-5xl">
              Everything You Need in One Storefront
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-500 dark:text-slate-300">
              Discover curated electronics, gaming, fashion, and appliances
              tailored for every part of your daily life.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                className="rounded-lg bg-amber-600 px-6 py-3 font-accent font-medium text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700"
              >
                Explore
              </Link>
              <Link
                to="/dashboard"
                className="rounded-lg border-2 border-amber-600 px-6 py-3 font-accent font-medium text-amber-600 transition-all hover:bg-amber-50 dark:hover:bg-amber-500/10"
              >
                View Dashboard
              </Link>
            </div>
          </div>
          <SmartImage
            src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80"
            alt="Ecommerce hero"
            wrapperClassName="h-80 w-full rounded-2xl md:h-[420px]"
            className="h-80 w-full rounded-2xl object-cover md:h-[420px]"
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl text-gray-900 dark:text-slate-100">
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Categories will appear here after backend integration.
            </p>
          </div>
        </div>

        <Carousel
          value={featuredCategories}
          numVisible={3}
          numScroll={1}
          responsiveOptions={responsiveOptions}
          itemTemplate={() => null}
        />
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl text-gray-900 dark:text-slate-100">
              New Arrivals
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Products will appear here after backend integration.
            </p>
          </div>
        </div>

        <Carousel
          value={newArrivals}
          numVisible={3}
          numScroll={1}
          responsiveOptions={responsiveOptions}
          itemTemplate={() => null}
        />
      </section>
    </div>
  );
}

export default HomePage;
