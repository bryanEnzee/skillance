import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  JobPosted,
  OwnershipTransferred
} from "../generated/FreelanceJobs/FreelanceJobs"

export function createJobPostedEvent(
  jobId: BigInt,
  employer: Address,
  title: string,
  budget: BigInt
): JobPosted {
  let jobPostedEvent = changetype<JobPosted>(newMockEvent())

  jobPostedEvent.parameters = new Array()

  jobPostedEvent.parameters.push(
    new ethereum.EventParam("jobId", ethereum.Value.fromUnsignedBigInt(jobId))
  )
  jobPostedEvent.parameters.push(
    new ethereum.EventParam("employer", ethereum.Value.fromAddress(employer))
  )
  jobPostedEvent.parameters.push(
    new ethereum.EventParam("title", ethereum.Value.fromString(title))
  )
  jobPostedEvent.parameters.push(
    new ethereum.EventParam("budget", ethereum.Value.fromUnsignedBigInt(budget))
  )

  return jobPostedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
