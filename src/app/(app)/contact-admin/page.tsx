"use client";

export default function ContactAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="text-body leading-relaxed text-center"
          style={{ color: "rgb(51, 65, 85)" }}
        >
          <p>
            Your account is currently not enabled to access this service. For
            activation or further assistance, please reach out to your account
            manager or write to us at
            <a
              href="mailto:contact@mfilterit.com"
              className="font-semibold  cursor-pointer"
            >
              &nbsp;contact@mfilterit.com
            </a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
}