// // "use client";

// // import * as React from "react";
// // import * as RechartsPrimitive from "recharts";

// // import { cn } from "@/lib/utils";

// // // Format: { THEME_NAME: CSS_SELECTOR }
// // const THEMES = { light: "", dark: ".dark" } as const;

// // export type ChartConfig = {
// //   [k in string]: {
// //     label?: React.ReactNode;
// //     icon?: React.ComponentType;
// //   } & (
// //     | { color?: string; theme?: never }
// //     | { color?: never; theme: Record<keyof typeof THEMES, string> }
// //   );
// // };

// // type ChartContextProps = {
// //   config: ChartConfig;
// // };

// // const ChartContext = React.createContext<ChartContextProps | null>(null);

// // function useChart() {
// //   const context = React.useContext(ChartContext);

// //   if (!context) {
// //     throw new Error("useChart must be used within a <ChartContainer />");
// //   }

// //   return context;
// // }

// // const ChartContainer = React.forwardRef<
// //   HTMLDivElement,
// //   React.ComponentProps<"div"> & {
// //     config: ChartConfig;
// //     children: React.ComponentProps<
// //       typeof RechartsPrimitive.ResponsiveContainer
// //     >["children"];
// //   }
// // >(({ id, className, children, config, ...props }, ref) => {
// //   const uniqueId = React.useId();
// //   const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

// //   return (
// //     <ChartContext.Provider value={{ config }}>
// //       <div
// //         data-chart={chartId}
// //         ref={ref}
// //         className={cn(
// //           "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
// //           className,
// //         )}
// //         {...props}
// //       >
// //         <ChartStyle id={chartId} config={config} />
// //         <RechartsPrimitive.ResponsiveContainer>
// //           {children}
// //         </RechartsPrimitive.ResponsiveContainer>
// //       </div>
// //     </ChartContext.Provider>
// //   );
// // });
// // ChartContainer.displayName = "Chart";

// // const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
// //   const colorConfig = Object.entries(config).filter(
// //     ([_, config]) => config.theme || config.color,
// //   );

// //   if (!colorConfig.length) {
// //     return null;
// //   }

// //   return (
// //     <style
// //       dangerouslySetInnerHTML={{
// //         __html: Object.entries(THEMES)
// //           .map(
// //             ([theme, prefix]) => `
// // ${prefix} [data-chart=${id}] {
// // ${colorConfig
// //   .map(([key, itemConfig]) => {
// //     const color =
// //       itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
// //       itemConfig.color;
// //     return color ? `  --color-${key}: ${color};` : null;
// //   })
// //   .join("\n")}
// // }
// // `,
// //           )
// //           .join("\n"),
// //       }}
// //     />
// //   );
// // };

// // const ChartTooltip = RechartsPrimitive.Tooltip;

// // const ChartTooltipContent = React.forwardRef<
// //   HTMLDivElement,
// //   React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
// //     React.ComponentProps<"div"> & {
// //       hideLabel?: boolean;
// //       hideIndicator?: boolean;
// //       indicator?: "line" | "dot" | "dashed";
// //       nameKey?: string;
// //       labelKey?: string;
// //       isPercentage?: boolean; // Add this prop
// //     }
// // >(
// //   (
// //     {
// //       active,
// //       payload,
// //       className,
// //       indicator = "dot",
// //       hideLabel = false,
// //       hideIndicator = false,
// //       label,
// //       labelFormatter,
// //       labelClassName,
// //       formatter,
// //       color,
// //       nameKey,
// //       labelKey,
// //       isPercentage = false, // Default to false
// //     },
// //     ref,
// //   ) => {
// //     const { config } = useChart();

// //     const tooltipLabel = React.useMemo(() => {
// //       if (hideLabel || !payload?.length) {
// //         return null;
// //       }

// //       const [item] = payload;
// //       const key = `${labelKey || item.dataKey || item.name || "value"}`;
// //       const itemConfig = getPayloadConfigFromPayload(config, item, key);
// //       const value =
// //         !labelKey && typeof label === "string"
// //           ? config[label as keyof typeof config]?.label || label
// //           : itemConfig?.label;

// //       if (labelFormatter) {
// //         return (
// //           <div className={cn("font-medium", labelClassName)}>
// //             {labelFormatter(value, payload)}
// //           </div>
// //         );
// //       }

// //       if (!value) {
// //         return null;
// //       }

// //       return <div className={cn("font-medium","bg-gray-100 dark:text-black", labelClassName)}>{value}</div>;
// //     }, [
// //       label,
// //       labelFormatter,
// //       payload,
// //       hideLabel,
// //       labelClassName,
// //       config,
// //       labelKey,
// //     ]);

// //     if (!active || !payload?.length) {
// //       return null;
// //     }

// //     const nestLabel = payload.length === 1 && indicator !== "dot";

// //     return (
// //       <div
// //         ref={ref}
// //         className={cn(
// //           "grid min-w-[10rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
// //           className,
// //         )}
// //       >
// //         {!nestLabel ? tooltipLabel : null}
// //         <div className="grid gap-1.5 ">
// //           {payload.map((item, index) => {
// //             const key = `${nameKey || item.name || item.dataKey || "value"}`;
// //             const itemConfig = getPayloadConfigFromPayload(config, item, key);
// //             const indicatorColor = color || item.payload.fill || item.color;

// //             return (
// //               <div
// //                 key={item.dataKey}
// //                 className={cn(
// //                   "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
// //                   indicator === "dot" && "items-center"
// //                 )}
// //               >
// //                 {formatter && item?.value !== undefined && item.name ? (
// //                   formatter(item.value, item.name, item, index, item.payload)
// //                 ) : (
// //                   <>
// //                     {itemConfig?.icon ? (
// //                       <itemConfig.icon />
// //                     ) : (
// //                       !hideIndicator && (
// //                         <div
// //                           className={cn(
// //                             "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
// //                             {
// //                               "h-2.5 w-2.5": indicator === "dot",
// //                               "w-1": indicator === "line",
// //                               "w-0 border-[1.5px] border-dashed bg-transparent":
// //                                 indicator === "dashed",
// //                               "my-0.5": nestLabel && indicator === "dashed",
// //                             },
// //                           )}
// //                           style={
// //                             {
// //                               "--color-bg": indicatorColor,
// //                               "--color-border": indicatorColor,
// //                             } as React.CSSProperties
// //                           }
// //                         />
// //                       )
// //                     )}
// //                     <div
// //                       className={cn(
// //                         "flex flex-1 justify-between leading-none text-small-font",
// //                         nestLabel ? "items-end" : "items-center",
// //                       )}
// //                     >
// //                       <div className="grid gap-1.5 ">
// //                         {nestLabel ? tooltipLabel : null}
// //                         <span className="text-muted-foreground">
// //                           {itemConfig?.label || item.name}
// //                         </span>
// //                       </div>
// //                       {item.value !== undefined && (
// //         <span className="font-mono font-medium text-small-font tabular-nums text-foreground">
// //           {typeof item.value === 'number' ? (
// //             isPercentage ? // Use the isPercentage prop instead
// //               `${item.value.toFixed(2)}%`
// //             : 
// //               item.value.toLocaleString()
// //           ) : (
// //             "-"
// //           )}
// //         </span>
// //       )}
// //                     </div>
// //                   </>
// //                 )}
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     );
// //   },
// // );
// // ChartTooltipContent.displayName = "ChartTooltip";

// // const ChartLegend = RechartsPrimitive.Legend;

// // const ChartLegendContent = React.forwardRef<
// //   HTMLDivElement,
// //   React.ComponentProps<"div"> &
// //     Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
// //       hideIcon?: boolean;
// //       nameKey?: string;
// //     }
// // >(
// //   (
// //     { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
// //     ref,
// //   ) => {
// //     const { config } = useChart();

// //     if (!payload?.length) {
// //       return null;
// //     }

// //     return (
// //       <div
// //         ref={ref}
// //         className={cn(
// //           "flex items-center justify-center gap-4 text-small-font",
// //           verticalAlign === "top" ? "pb-3" : "pt-3",
// //           className,
// //         )}
// //       >
// //         {payload.map((item) => {
// //           const key = `${nameKey || item.dataKey || "value"}`;
// //           const itemConfig = getPayloadConfigFromPayload(config, item, key);

// //           return (
// //             <div
// //               key={item.value}
// //               className={cn(
// //                 "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
// //               )}
// //             >
// //               {itemConfig?.icon && !hideIcon ? (
// //                 <itemConfig.icon />
// //               ) : (
// //                 <div
// //                   className="h-2 w-2 shrink-0 rounded-[2px]"
// //                   style={{
// //                     backgroundColor: item.color,
// //                   }}
// //                 />
// //               )}
// //               {itemConfig?.label}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     );
// //   },
// // );
// // ChartLegendContent.displayName = "ChartLegend";

// // // Helper to extract item config from a payload.
// // function getPayloadConfigFromPayload(
// //   config: ChartConfig,
// //   payload: unknown,
// //   key: string,
// // ) {
// //   if (typeof payload !== "object" || payload === null) {
// //     return undefined;
// //   }

// //   const payloadPayload =
// //     "payload" in payload &&
// //     typeof payload.payload === "object" &&
// //     payload.payload !== null
// //       ? payload.payload
// //       : undefined;

// //   let configLabelKey: string = key;

// //   if (
// //     key in payload &&
// //     typeof payload[key as keyof typeof payload] === "string"
// //   ) {
// //     configLabelKey = payload[key as keyof typeof payload] as string;
// //   } else if (
// //     payloadPayload &&
// //     key in payloadPayload &&
// //     typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
// //   ) {
// //     configLabelKey = payloadPayload[
// //       key as keyof typeof payloadPayload
// //     ] as string;
// //   }

// //   return configLabelKey in config
// //     ? config[configLabelKey]
// //     : config[key as keyof typeof config];
// // }

// // export {
// //   ChartContainer,
// //   ChartTooltip,
// //   ChartTooltipContent,
// //   ChartLegend,
// //   ChartLegendContent,
// //   ChartStyle,
// // };
// "use client";

// import * as React from "react";
// import * as RechartsPrimitive from "recharts";

// import { cn } from "@/lib/utils";

// // Format: { THEME_NAME: CSS_SELECTOR }
// const THEMES = { light: "", dark: ".dark" } as const;

// export type ChartConfig = {
//   [k in string]: {
//     label?: React.ReactNode;
//     icon?: React.ComponentType;
//   } & (
//     | { color?: string; theme?: never }
//     | { color?: never; theme: Record<keyof typeof THEMES, string> }
//   );
// };

// type ChartContextProps = {
//   config: ChartConfig;
// };

// const ChartContext = React.createContext<ChartContextProps | null>(null);

// function useChart() {
//   const context = React.useContext(ChartContext);

//   if (!context) {
//     throw new Error("useChart must be used within a <ChartContainer />");
//   }

//   return context;
// }

// const ChartContainer = React.forwardRef<
//   HTMLDivElement,
//   React.ComponentProps<"div"> & {
//     config: ChartConfig;
//     children: React.ComponentProps<
//       typeof RechartsPrimitive.ResponsiveContainer
//     >["children"];
//   }
// >(({ id, className, children, config, ...props }, ref) => {
//   const uniqueId = React.useId();
//   const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

//   return (
//     <ChartContext.Provider value={{ config }}>
//       <div
//         data-chart={chartId}
//         ref={ref}
//         className={cn(
//           "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
//           className,
//         )}
//         {...props}
//       >
//         <ChartStyle id={chartId} config={config} />
//         <RechartsPrimitive.ResponsiveContainer>
//           {children}
//         </RechartsPrimitive.ResponsiveContainer>
//       </div>
//     </ChartContext.Provider>
//   );
// });
// ChartContainer.displayName = "Chart";

// const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
//   const colorConfig = Object.entries(config).filter(
//     ([_, config]) => config.theme || config.color,
//   );

//   if (!colorConfig.length) {
//     return null;
//   }

//   return (
//     <style
//       dangerouslySetInnerHTML={{
//         __html: Object.entries(THEMES)
//           .map(
//             ([theme, prefix]) => `
// ${prefix} [data-chart=${id}] {
// ${colorConfig
//   .map(([key, itemConfig]) => {
//     const color =
//       itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
//       itemConfig.color;
//     return color ? `  --color-${key}: ${color};` : null;
//   })
//   .join("\n")}
// }
// `,
//           )
//           .join("\n"),
//       }}
//     />
//   );
// };

// const ChartTooltip = RechartsPrimitive.Tooltip;

// const ChartTooltipContent = React.forwardRef<
//   HTMLDivElement,
//   React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
//     React.ComponentProps<"div"> & {
//       hideLabel?: boolean;
//       hideIndicator?: boolean;
//       indicator?: "line" | "dot" | "dashed";
//       nameKey?: string;
//       labelKey?: string;
//       isPercentage?: boolean; // Add this prop
//       isFullscreen?: boolean; // Add fullscreen prop
//     }
// >(
//   (
//     {
//       active,
//       payload,
//       className,
//       indicator = "dot",
//       hideLabel = false,
//       hideIndicator = false,
//       label,
//       labelFormatter,
//       labelClassName,
//       formatter,
//       color,
//       nameKey,
//       labelKey,
//       isPercentage = false, // Default to false
//       isFullscreen = false, // Default to false
//     },
//     ref,
//   ) => {
//     const { config } = useChart();

//     const tooltipLabel = React.useMemo(() => {
//       if (hideLabel || !payload?.length) {
//         return null;
//       }

//       const [item] = payload;
//       const key = `${labelKey || item.dataKey || item.name || "value"}`;
//       const itemConfig = getPayloadConfigFromPayload(config, item, key);
//       const value =
//         !labelKey && typeof label === "string"
//           ? config[label as keyof typeof config]?.label || label
//           : itemConfig?.label;

//       if (labelFormatter) {
//         return (
//           <div className={cn("font-medium", labelClassName)}>
//             {labelFormatter(value, payload)}
//           </div>
//         );
//       }

//       if (!value) {
//         return null;
//       }

//       return <div className={cn("font-medium","bg-gray-100 dark:text-black", labelClassName)}>{value}</div>;
//     }, [
//       label,
//       labelFormatter,
//       payload,
//       hideLabel,
//       labelClassName,
//       config,
//       labelKey,
//     ]);

//     if (!active || !payload?.length) {
//       return null;
//     }

//     const nestLabel = payload.length === 1 && indicator !== "dot";

//     return (
//       <div
//         ref={ref}
//         className={cn(
//           "grid min-w-[10rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 shadow-xl",
//           isFullscreen ? "text-sm" : "text-xs",
//           className,
//         )}
//       >
//         {!nestLabel ? tooltipLabel : null}
//         <div className="grid gap-1.5 ">
//           {payload.map((item, index) => {
//             const key = `${nameKey || item.name || item.dataKey || "value"}`;
//             const itemConfig = getPayloadConfigFromPayload(config, item, key);
//             const indicatorColor = color || item.payload.fill || item.color;

//             return (
//               <div
//                 key={item.dataKey}
//                 className={cn(
//                   "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
//                   indicator === "dot" && "items-center"
//                 )}
//               >
//                 {formatter && item?.value !== undefined && item.name ? (
//                   formatter(item.value, item.name, item, index, item.payload)
//                 ) : (
//                   <>
//                     {itemConfig?.icon ? (
//                       <itemConfig.icon />
//                     ) : (
//                       !hideIndicator && (
//                         <div
//                           className={cn(
//                             "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
//                             {
//                               "h-2.5 w-2.5": indicator === "dot",
//                               "w-1": indicator === "line",
//                               "w-0 border-[1.5px] border-dashed bg-transparent":
//                                 indicator === "dashed",
//                               "my-0.5": nestLabel && indicator === "dashed",
//                             },
//                           )}
//                           style={
//                             {
//                               "--color-bg": indicatorColor,
//                               "--color-border": indicatorColor,
//                             } as React.CSSProperties
//                           }
//                         />
//                       )
//                     )}
//                     <div
//                       className={cn(
//                         "flex flex-1 justify-between leading-none",
//                         isFullscreen ? "text-sm" : "text-small-font",
//                         nestLabel ? "items-end" : "items-center",
//                       )}
//                     >
//                       <div className="grid gap-1.5 ">
//                         {nestLabel ? tooltipLabel : null}
//                         <span className="text-muted-foreground">
//                           {itemConfig?.label || item.name}
//                         </span>
//                       </div>
//                       {item.value !== undefined && (
//         <span className={cn(
//           "font-mono font-medium tabular-nums text-foreground",
//           isFullscreen ? "text-sm" : "text-small-font"
//         )}>
//           {typeof item.value === 'number' ? (
//             isPercentage ?
//               `${item.value.toFixed(2)}%`
//             : 
//               item.value.toLocaleString()
//           ) : (
//             "-"
//           )}
//         </span>
//       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   },
// );
// ChartTooltipContent.displayName = "ChartTooltip";

// const ChartLegend = RechartsPrimitive.Legend;

// const ChartLegendContent = React.forwardRef<
//   HTMLDivElement,
//   React.ComponentProps<"div"> &
//     Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
//       hideIcon?: boolean;
//       nameKey?: string;
//       isFullscreen?: boolean; // Add fullscreen prop
//     }
// >(
//   (
//     { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, isFullscreen = false },
//     ref,
//   ) => {
//     const { config } = useChart();

//     if (!payload?.length) {
//       return null;
//     }

//     return (
//       <div
//         ref={ref}
//         className={cn(
//           "flex items-center justify-center gap-4",
//           isFullscreen ? "text-base" : "text-small-font",
//           verticalAlign === "top" ? "pb-3" : "pt-3",
//           className,
//         )}
//       >
//         {payload.map((item) => {
//           const key = `${nameKey || item.dataKey || "value"}`;
//           const itemConfig = getPayloadConfigFromPayload(config, item, key);

//           return (
//             <div
//               key={item.value}
//               className={cn(
//                 "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
//               )}
//             >
//               {itemConfig?.icon && !hideIcon ? (
//                 <itemConfig.icon />
//               ) : (
//                 <div
//                   className={cn(
//                     "shrink-0 rounded-[2px]",
//                     isFullscreen ? "h-3 w-3" : "h-2 w-2"
//                   )}
//                   style={{
//                     backgroundColor: item.color,
//                   }}
//                 />
//               )}
//               {itemConfig?.label}
//             </div>
//           );
//         })}
//       </div>
//     );
//   },
// );
// ChartLegendContent.displayName = "ChartLegend";

// // Helper to extract item config from a payload.
// function getPayloadConfigFromPayload(
//   config: ChartConfig,
//   payload: unknown,
//   key: string,
// ) {
//   if (typeof payload !== "object" || payload === null) {
//     return undefined;
//   }

//   const payloadPayload =
//     "payload" in payload &&
//     typeof payload.payload === "object" &&
//     payload.payload !== null
//       ? payload.payload
//       : undefined;

//   let configLabelKey: string = key;

//   if (
//     key in payload &&
//     typeof payload[key as keyof typeof payload] === "string"
//   ) {
//     configLabelKey = payload[key as keyof typeof payload] as string;
//   } else if (
//     payloadPayload &&
//     key in payloadPayload &&
//     typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
//   ) {
//     configLabelKey = payloadPayload[
//       key as keyof typeof payloadPayload
//     ] as string;
//   }

//   return configLabelKey in config
//     ? config[configLabelKey]
//     : config[key as keyof typeof config];
// }

// // Reusable CustomTick component
// interface CustomTickProps {
//   x: number;
//   y: number;
//   payload: {
//     value: string | number;
//   };
//   chartConfig?: {
//     [key: string]: {
//       label: string;
//       color: string;
//     };
//   };
//   isFullscreen?: boolean;
//   angle?: number;
//   textAnchor?: string;
//   xOffset?: number;
//   yOffset?: number;
//   maxLength?: number;
//   truncateLength?: number;
//   axisType?: 'x' | 'y'; // Add axis type for better positioning
//   disableTruncate?: boolean; // If true, show full label
//   yAxisXOffset?: number; // Custom xOffset for Y-axis labels
//   yAxisXOffsetFullscreen?: number; // Custom xOffset for Y-axis labels in fullscreen
// }

// const CustomTick: React.FC<CustomTickProps> = ({ 
//   x, 
//   y, 
//   payload, 
//   chartConfig,
//   isFullscreen = false,
//   angle = 0,
//   textAnchor = "middle",
//   xOffset = 9,
//   yOffset = 0,
//   maxLength = 8,
//   truncateLength = 6,
//   axisType = 'x',
//   disableTruncate = false,
//   yAxisXOffset,
//   yAxisXOffsetFullscreen
// }) => {
//   const label = chartConfig?.[payload.value]?.label || payload.value;
//   const labelString = String(label); // Convert to string for length and slice operations
  
//   // Adjust values based on fullscreen state and axis type
//   const fontSize = isFullscreen ? 16 : 10;
  
//   // Calculate dynamic width based on text length for Y-axis with minimal parameters
//   const getDynamicWidth = (text: string, isYAxis: boolean) => {
//     if (!isYAxis) {
//       return isFullscreen ? "80px" : "60px"; // X-axis keeps fixed width
//     }
    
//     const charWidth = isFullscreen ? 5 : 4; // Further reduced width per character
//     const minWidth = isFullscreen ? 20 : 15; // Further reduced minimum width
//     const maxWidth = isFullscreen ? 50 : 40; // Further reduced maximum width
    
//     const calculatedWidth = text.length * charWidth;
//     return Math.max(minWidth, Math.min(calculatedWidth, maxWidth)) + "px";
//   };
  
//   const width = getDynamicWidth(labelString, axisType === 'y');
//   const adjustedMaxLength = axisType === 'y' ? (isFullscreen ? 15 : 12) : (isFullscreen ? maxLength + 2 : maxLength);
//   const adjustedTruncateLength = axisType === 'y' ? (isFullscreen ? 12 : 10) : (isFullscreen ? truncateLength + 2 : truncateLength);

//   // Adjust positioning based on axis type - use yAxisXOffset if provided, otherwise default to -12 for Y-axis
//   const adjustedXOffset = axisType === 'y' ? (yAxisXOffset !== undefined ? (isFullscreen ? (yAxisXOffsetFullscreen !== undefined ? yAxisXOffsetFullscreen : -6) : yAxisXOffset) : (isFullscreen ? -6 : -6)) : xOffset;
//   const adjustedTextAnchor = textAnchor; // Use the passed textAnchor prop instead of overriding

//   return (
//     <g transform={`translate(${x},${y})`}>
//       <title>{labelString}</title> {/* Tooltip on hover */}
//       <text
//         x={adjustedXOffset}
//         y={yOffset}
//         dy={4} // Adjusts vertical alignment
//         textAnchor={adjustedTextAnchor}
//         fontSize={fontSize}
//         className="truncate w-24"
//         style={{
//           whiteSpace: "nowrap",
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//           width: width,
//         }}
//       >
//         {disableTruncate
//           ? labelString
//           : labelString.length > adjustedMaxLength
//             ? `${labelString.slice(0, adjustedTruncateLength)}...`
//             : labelString}
//       </text>
//     </g>
//   );
// };

// export {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartLegend,
//   ChartLegendContent,
//   ChartStyle,
//   CustomTick,
// };
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
      isPercentage?: boolean; // Add this prop
      isFullscreen?: boolean; // Add fullscreen prop
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      isPercentage = false, // Default to false
      isFullscreen = false, // Default to false
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium","bg-gray-100 dark:text-black", labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[10rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 shadow-xl",
          isFullscreen ? "text-subBody" : "text-xs",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5 ">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            },
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        isFullscreen ? "text-subBody" : "text-subBody",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5 ">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value !== undefined && (
        <span className={cn(
          "font-mono font-medium tabular-nums text-foreground",
          isFullscreen ? "text-subBody" : "text-subBody"
        )}>
          {typeof item.value === 'number' ? (
            isPercentage ?
              `${item.value.toFixed(2)}%`
            : 
              item.value.toLocaleString()
          ) : (
            "-"
          )}
        </span>
      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
      isFullscreen?: boolean; // Add fullscreen prop
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, isFullscreen = false },
    ref,
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          isFullscreen ? "text-base" : "text-subBody",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className,
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className={cn(
                    "shrink-0 rounded-[2px]",
                    isFullscreen ? "h-3 w-3" : "h-2 w-2"
                  )}
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  },
);
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

// Reusable CustomTick component
interface CustomTickProps {
  x: number;
  y: number;
  payload: {
    value: string | number;
  };
  chartConfig?: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  isFullscreen?: boolean;
  angle?: number;
  textAnchor?: string;
  xOffset?: number;
  yOffset?: number;
  maxLength?: number;
  truncateLength?: number;
  axisType?: 'x' | 'y'; // Add axis type for better positioning
  disableTruncate?: boolean; // If true, show full label
  yAxisXOffset?: number; // Custom xOffset for Y-axis labels
  yAxisXOffsetFullscreen?: number; // Custom xOffset for Y-axis labels in fullscreen
}

const CustomTick = ({ 
  x, 
  y, 
  payload, 
  chartConfig,
  isFullscreen = false,
  angle = 0,
  textAnchor = "middle",
  xOffset = 9,
  yOffset = 0,
  maxLength = 8,
  truncateLength = 6,
  axisType = 'x',
  disableTruncate = false,
  yAxisXOffset,
  yAxisXOffsetFullscreen
}:CustomTickProps) => {
  const label = chartConfig?.[payload.value]?.label || payload.value;
  const labelString = String(label); // Convert to string for length and slice operations
  
  // Adjust values based on fullscreen state and axis type
  const fontSize = isFullscreen ? 16 : 10;
  
  // Calculate dynamic width based on text length for Y-axis with minimal parameters
  const getDynamicWidth = (text: string, isYAxis: boolean) => {
    if (!isYAxis) {
      return isFullscreen ? "80px" : "60px"; // X-axis keeps fixed width
    }
    
    const charWidth = isFullscreen ? 5 : 4; // Further reduced width per character
    const minWidth = isFullscreen ? 20 : 15; // Further reduced minimum width
    const maxWidth = isFullscreen ? 50 : 40; // Further reduced maximum width
    
    const calculatedWidth = text.length * charWidth;
    return Math.max(minWidth, Math.min(calculatedWidth, maxWidth)) + "px";
  };
  
  const width = getDynamicWidth(labelString, axisType === 'y');
  const adjustedMaxLength = axisType === 'y' ? (isFullscreen ? 15 : 12) : (isFullscreen ? maxLength + 2 : maxLength);
  const adjustedTruncateLength = axisType === 'y' ? (isFullscreen ? 12 : 10) : (isFullscreen ? truncateLength + 2 : truncateLength);

  // Adjust positioning based on axis type - use yAxisXOffset if provided, otherwise default to -12 for Y-axis
  const adjustedXOffset = axisType === 'y' ? (yAxisXOffset !== undefined ? (isFullscreen ? (yAxisXOffsetFullscreen !== undefined ? yAxisXOffsetFullscreen : -6) : yAxisXOffset) : (isFullscreen ? -6 : -6)) : xOffset;
  const adjustedTextAnchor = textAnchor; // Use the passed textAnchor prop instead of overriding

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{labelString}</title> {/* Tooltip on hover */}
      <text
        x={adjustedXOffset}
        y={yOffset}
        dy={4} // Adjusts vertical alignment
        textAnchor={adjustedTextAnchor}
        fontSize={fontSize}
        className="truncate w-24"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: width,
        }}
      >
        {disableTruncate
          ? labelString
          : labelString.length > adjustedMaxLength
            ? `${labelString.slice(0, adjustedTruncateLength)}...`
            : labelString}
      </text>
    </g>
  );
};

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  CustomTick,
};
