export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
      <div className="px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2026 EduLearn. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}