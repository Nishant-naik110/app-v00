"use client";
import { Button } from "@/components/ui/button";
import React from "react";

interface HomeProps {
  logoUrl: string;
  logoSize: string;
  InfoText: string;
  children: React.ReactNode;
}

const Home = ({
  children,
  logoSize,
  logoUrl,
  InfoText,
}: HomeProps) => {
  return (
    <HomeBackground
      logo={
        <img src={logoUrl} alt="Logo" className={`${logoSize} p-2 md:p-0`} />
      }
    >
      <div className="flex flex-col items-center justify-evenly md:w-7/12">
        <div className="rounded-lg bg-primary p-6 text-center">
          <p className="text-body text-white">{InfoText}</p>
          <a
            href="https://www.mfilterit.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              className="font-bold text-white hover:opacity-90"
            >
              Our Products
            </Button>
          </a>
        </div>
      </div>
      {children}
    </HomeBackground>
  );
};

export default Home;

export const HomeBackground: React.FC<{
  children: React.ReactNode;
  logo: React.ReactNode;
}> = ({ children, logo }) => {
  return (
    <>
      <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute -bottom-16 -left-10 z-0 h-48 w-48 rounded-full bg-primary opacity-30"></div>
        <div className="absolute -right-10 -top-16 z-0 h-48 w-48 rounded-full bg-primary opacity-30"></div>
        <div className="absolute -bottom-16 right-5 z-0 h-64 w-64 rounded-lg bg-primary opacity-50"></div>
        <div className="absolute left-0 top-2 z-10 flex w-full justify-center md:left-5 md:top-5 md:w-auto">
          {logo}
        </div>

        <div className="z-10 flex w-full flex-col items-center justify-evenly gap-10 px-10 md:flex-row">
          {children}
        </div>
      </div>
    </>
  );
};
