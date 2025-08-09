import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts"
import {
  JobPosted,
  JobApplied,
  ApplicationStatusUpdated,
  WorkSubmitted,
  PaymentApproved
} from "../generated/FreelanceJobs/FreelanceJobs"
import { Job, Application } from "../generated/schema"

export function handleJobPosted(event: JobPosted): void {
  let job = new Job(event.params.jobId.toString())

  job.jobId = event.params.jobId
  job.employer = event.params.employer
  job.title = event.params.title
  job.description = event.params.description
  job.skills = event.params.skills
  job.budget = event.params.budget
  job.durationInDays = event.params.durationInDays
  job.stakeRequired = event.params.stakeRequired
  job.postedAt = event.block.timestamp
  
  job.hasFreelancer = false
  job.acceptedApplicant = Bytes.fromHexString("0x0000000000000000000000000000000000000000")
  job.submittedWorkUrl = ""
  job.workSubmitted = false
  job.paid = false

  job.save()
}

export function handleJobApplied(event: JobApplied): void {
  const applicationId = event.params.jobId.toString() + "-" + event.params.applicant.toHexString()
  let application = new Application(applicationId)
  
  application.job = event.params.jobId.toString()
  application.applicant = event.params.applicant
  application.proposal = event.params.proposal
  application.status = "Pending"
  
  application.save()
}

export function handleApplicationStatusUpdated(event: ApplicationStatusUpdated): void {
  const jobId = event.params.jobId.toString()
  const applicantAddress = event.params.applicant
  const status = event.params.status
  
  let job = Job.load(jobId)
  if (!job) {
    log.error("Job with ID {} not found", [jobId])
    return
  }

  const applicationId = jobId + "-" + applicantAddress.toHexString()
  let application = Application.load(applicationId)

  if (application) {
      if (status == 1) { 
        application.status = "Accepted"
        job.hasFreelancer = true
        job.acceptedApplicant = applicantAddress
      } else { 
        application.status = "Rejected"
      }
      application.save()
      job.save()
  } else {
    log.error("Application for Job {} and Applicant {} not found", [jobId, applicantAddress.toHexString()])
  }
}

export function handleWorkSubmitted(event: WorkSubmitted): void {
  let job = Job.load(event.params.jobId.toString())
  if (job) {
    job.submittedWorkUrl = event.params.submittedWorkUrl
    job.workSubmitted = true 
    job.save()
  }
}

export function handlePaymentApproved(event: PaymentApproved): void {
  let job = Job.load(event.params.jobId.toString())
  if (job) {
    job.paid = true 
    job.save()
  }
  log.info("Payment approved for jobId {} to freelancer {}", [
    event.params.jobId.toString(),
    event.params.freelancer.toHexString()
  ])
}

