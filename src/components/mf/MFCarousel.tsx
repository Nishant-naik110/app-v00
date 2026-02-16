import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface MFCarouselProps {
  data: string[];
  toggle?: boolean;
  border?: boolean;
  indicator?: boolean;
  autoplay?: boolean;
  autoplay_delay?: number;
  children?: React.ReactNode;
}

const d = [
  "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dicta!",
  "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dicta!",
  "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dicta!",
  "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dicta!",
  "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dicta!",
];

export default function MFCarousel({
  data = d,
  toggle = false,
  border = true,
  indicator,
  autoplay = true,
  autoplay_delay = 4000,
}: MFCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (data.length > 0)
    return (
      <Carousel
        className="w-full max-w-lg"
        setApi={setApi}
        plugins={[Autoplay({ delay: autoplay_delay, active: autoplay })]}
      >
        <CarouselContent>
          {data.map((text, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className={`bg-transparent ${border ? "" : "border-0"}`}>
                  <CardContent className="flex items-center justify-center p-6">
                    <span className="text-xl font-semibold text-primary">
                      {text}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {toggle && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
        {indicator && (
          <div className="flex items-center justify-center">
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className={`m-1 block h-2 w-2 rounded-full border-2 border-gray-500 ${
                  i + 1 === current && "bg-gray-700"
                }`}
              ></span>
            ))}
          </div>
        )}
      </Carousel>
    );
  return <></>;
}
