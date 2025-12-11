import { inngest } from "./client";

// Flujo básico de abandono; placeholder para futura lógica real
export const abandonmentFlow = inngest.createFunction(
  { id: "abandonment-flow" },
  { event: "app/abandonment.triggered" },
  async ({ event }) => {
    return {
      status: "received",
      event,
    };
  }
);
