const axios = require("axios");
const { Log, getAuthToken } = require("../logging_middleware/index");

const optimizeTasks = (serviceJobs, maxTime) => {
  const maxImpactTracker = new Int32Array(maxTime + 1);

  serviceJobs.forEach((job) => {
    const timeAllocated = job.Duration ?? job.duration;
    const valueScore = job.Impact ?? job.impact;

    for (let currentSlot = maxTime; currentSlot >= timeAllocated; currentSlot--) {
      const includeCurrent = maxImpactTracker[currentSlot - timeAllocated] + valueScore;
      if (includeCurrent > maxImpactTracker[currentSlot]) {
        maxImpactTracker[currentSlot] = includeCurrent;
      }
    }
  });

  return maxImpactTracker[maxTime];
};

const executeJobAssignment = async () => {
    try {
        const sessionKey = await getAuthToken();
        if (!sessionKey) return;
        
        const apiConfig = { headers: { Authorization: `Bearer ${sessionKey}` } };
        
        const [depotRes, vehicleRes] = await Promise.all([
            axios.get("http://20.207.122.201/evaluation-service/depots", apiConfig),
            axios.get("http://20.207.122.201/evaluation-service/vehicles", apiConfig)
        ]);

        const availableDepots = depotRes.data.depots || depotRes.data;
        const pendingVehicles = vehicleRes.data.vehicles || vehicleRes.data;

        for (const loc of availableDepots) {
          const { MechanicHours, mechanicHours, ID, id } = loc;
          const assignedHours = MechanicHours ?? mechanicHours;
          const locationId = ID ?? id;

          const optimalImpact = optimizeTasks(pendingVehicles, assignedHours);

          console.log(`Depot ${locationId}: ${optimalImpact}`);
          await Log("backend", "info", "cron_job", `Depot ${locationId} processed`);
        }
    } catch (error) {
        console.error("Assignment Execution Failed:", error.message);
    }
};

executeJobAssignment();
