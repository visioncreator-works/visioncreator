import { createOperation, z } from "../generated/wundergraph.factory";

export default createOperation.mutation({
  input: z.object({
    mandateId: z.string(),
    templateId: z.string(),
    amount: z.number().int().positive().optional(),
    name: z.string().min(1).optional(),
    intervalUnit: z.enum(["weekly", "monthly", "yearly"]).default("monthly"),
  }),
  requireAuthentication: true,
  rbac: {
    requireMatchAll: ["authenticated"],
  },
  handler: async ({ input, context }) => {
    try {
      const { mandateId, templateId, intervalUnit } = input;

      // Fetch all billing request templates
      const templatesResponse =
        await context.gocardless.billingRequestTemplates.list();

      if (
        !templatesResponse.billing_request_templates ||
        templatesResponse.billing_request_templates.length === 0
      ) {
        throw new Error("No billing request templates found");
      }

      // Find the matching template
      const template = templatesResponse.billing_request_templates.find(
        (t) => t.id === templateId
      );

      if (!template) {
        throw new Error("Billing request template not found");
      }

      const templateDetails = template as {
        mandate_request_currency?: string;
        payment_request_amount?: number;
        payment_request_currency?: string;
        name?: string;
      };
      const amount =
        input.amount ?? templateDetails.payment_request_amount ?? 3966;
      const currency =
        templateDetails.mandate_request_currency ??
        templateDetails.payment_request_currency ??
        "EUR";
      const name =
        input.name ?? templateDetails.name ?? "VisionCreator subscription";

      // Create a subscription from the selected billing request template.
      const subscription = await context.gocardless.subscriptions.create({
        amount,
        currency,
        name,
        interval_unit: intervalUnit,
        metadata: {
          template_id: templateId,
        },
        links: {
          mandate: mandateId,
        },
      });

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error("Error creating subscription:", error);
      return {
        success: false,
        message: "Failed to create subscription",
        error:
          error instanceof Error ? error.message : "Unknown subscription error",
      };
    }
  },
});
