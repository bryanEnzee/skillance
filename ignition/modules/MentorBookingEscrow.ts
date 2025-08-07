import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MentorBookingEscrow", (m) => {
  const mentorBookingEscrow = m.contract("MentorBookingEscrow");

  return { mentorBookingEscrow };
}); 