import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="/" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              首页
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link href="/articles" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              文章
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link href="/tools" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              工具箱
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link href="/about" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              关于
            </Link>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; 2025 小勇同学. 保留所有权利.
        </p>
      </div>
    </footer>
  );
};

export default Footer;