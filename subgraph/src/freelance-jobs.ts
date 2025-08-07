import { BigInt } from "@graphprotocol/graph-ts"
import { JobPosted } from "../generated/FreelanceJobs/FreelanceJobs"
import { Job } from "../generated/schema"

export function handleJobPosted(event: JobPosted): void {
  let job = new Job(event.params.jobId.toString())

  job.jobId = event.params.jobId
  job.employer = event.params.employer
  job.title = event.params.title
  job.description = event.params.description
  job.skills = event.params.skills
  job.budget = event.params.budget
  job.durationInDays = event.params.durationInDays.toI32()
  job.stakeRequired = event.params.stakeRequired
  job.postedAt = event.block.timestamp

  job.save()
}

