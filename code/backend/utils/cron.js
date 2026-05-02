const cron = require("node-cron");
const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const Property = require("../models/Property");

// This cron job runs at 00:00 on the 1st day of every month
// It automatically issues pending payments for all active leases
const startCronJobs = () => {
  cron.schedule("0 0 1 * *", async () => {
    console.log("CRON: Running monthly rent payment generation...");
    
    try {
      // Find all active leases (you could enhance this by checking startDate and endDate if needed)
      // For now, we assume all leases in the database without an 'inactive' status are active
      const activeLeases = await Lease.find().populate("property");

      let createdCount = 0;

      for (const lease of activeLeases) {
        if (!lease.property) continue; // safety check
        
        const amount = lease.property.rent || 0;
        if (amount <= 0) continue;

        // Create a new pending payment
        await Payment.create({
          tenant: lease.tenant,
          property: lease.property._id,
          amount: amount,
          status: "pending",
        });

        createdCount++;
      }

      console.log(`CRON: Successfully generated ${createdCount} monthly rent payments.`);
    } catch (err) {
      console.error("CRON Error: Failed to generate monthly payments", err);
    }
  });

  console.log("CRON jobs initialized.");
};

module.exports = startCronJobs;
