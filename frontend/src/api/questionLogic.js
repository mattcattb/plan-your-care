function questionLogic(state, weeks, states) {
  const data = states.find((candidate) => candidate.abbr === state);
  if (!data) {
    return {data: null, aborMess: "We could not find information for that state."};
  }

  const careMayBeAvailable = Number(weeks) <= data.weeksBan;
  const aborMess = careMayBeAvailable
    ? "Based on the reference data, care may be available at this stage. Use the Clinic Finder and confirm current requirements with a provider."
    : "The reference data indicates restrictions at this stage. Laws and exceptions change, so contact a provider or trusted hotline to confirm current options, including care in another state.";

  return {data, aborMess};
}

export default questionLogic;
