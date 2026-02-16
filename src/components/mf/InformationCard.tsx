import React from 'react';
import { Card,
    CardContent,
    
    CardHeader,
    CardTitle,

 } from '@/components/ui/card';

 interface InformationCardProps{
    InformTitle?:string;
    informDescription?:string;
 }

export const InformationCard = ({
    InformTitle,
    informDescription
}: InformationCardProps) => {
  return (
    <>
    <Card className='shadow-md rounded-md  w-[120px] xl:w-[200px] h-15 xl:h-20 mb-2 dark:bg-background'>
        <CardHeader className='p-1 bg-yellow-300'>
            <CardTitle className='text-tiny-font sm:text-tiny-font lg:text-subBody xl:text-subBody md:text-tiny-font font-semibold dark:text-black'>
                {InformTitle}
            </CardTitle>
        </CardHeader>
        <CardContent className='text-tiny-font sm:text-tiny-font lg:text-subBody xl:text-subBody md:text-tiny-font mt-0'>
            {informDescription}
        </CardContent>

    </Card>
    </>
  )
}
