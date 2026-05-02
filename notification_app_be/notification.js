const axios = require("axios");
const { getAuthToken } = require("../logging_middleware/index");

const retrieveData = async () => {
  const bearerToken = await getAuthToken();
  if (!bearerToken) throw new Error("Authorization credentials unavailable");
  
  const reqConf = { headers: { Authorization: `Bearer ${bearerToken}` } };
  const payload = await axios.get("http://20.207.122.201/evaluation-service/notifications", reqConf);
  return payload.data.notifications ?? payload.data;
};

const determineRank = (notifType) => {
  if (!notifType) return 0;
  switch (notifType.toLowerCase()) {
    case 'placement': return 3;
    case 'result': return 2;
    case 'event': return 1;
    default: return 0;
  }
};

const getTopNotifications = async () => {
  const rawList = await retrieveData();

  rawList.sort((notifA, notifB) => {
    const rankA = determineRank(notifA.Type ?? notifA.type);
    const rankB = determineRank(notifB.Type ?? notifB.type);

    if (rankA !== rankB) {
      return rankB - rankA; // Sort by priority descending
    }

    // Tie-breaker: timestamp
    const timeA = new Date(notifA.Timestamp ?? notifA.timestamp).getTime();
    const timeB = new Date(notifB.Timestamp ?? notifB.timestamp).getTime();
    return timeB - timeA;
  });

  return rawList.slice(0, 10);
};

module.exports = { getTopNotifications };
