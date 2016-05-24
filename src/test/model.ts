import * as Moment from "moment";
import * as Entities from "../../../server/src/server/entities";
import {maxBy, minBy, values } from "common-ts/lib/core";
export { values }

function hasMany(target: any, key: string, descriptor: PropertyDescriptor) { return descriptor; }

function hasOne<T>(c: { new (x: any): T }, relative: (master: ModelMaster) => Dict<T>, nameOverride = null) {
    return null;
    //return function (target: any, key: string, descriptor: PropertyDescriptor) { };
}

function root(construc: Function) {
}

function queryBy(fn:Function) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => descriptor; 
}



interface IUserWhere {
    namedLike?:string;
}


@root
export class ModelMaster {
    user: IUser;
    
    @queryBy(IUserWhere)
    users: Dict<IUser>;
    
    qualifications: Dict<IQualification>;
    sites: Dict<ISite>;
    contracts: Dict<IContract>;
    capabilities: Dict<ICapability>;
    projects: Dict<IProject>;
    jobs: Dict<IJob>;
    jobRequirements: Dict<IJobRequirement>;
    availabilityEvents: Dict<IAvailabilityEvent>;
    assignments: Dict<IAssignment>;
    userSites: Dict<IUserSite>;
    timesheets: Dict<Timesheet>;
    agencies: Dict<IAgency>;
    clients: Dict<Client>;
    history: History;
    loading: boolean;
}


export class BaseEntity {
    constructor(seed: any) { Object.assign(this, seed); }
    public id: string;
}

export class IUser extends BaseEntity implements Entities.IUser {
    public userid: string;
    public email: string;
    public works_code: string;
    public first_name: string;
    public last_name: string;
    public birth_date: string;
    public national_insurance: string;
    public address_street: string;
    public address_town: string;
    public address_area: string;
    public post_code: string;
    public approved: boolean;
    public picture: string;
    public phone_number: string;
    public alt_phone_number: string;
    public role: string;
    public longitude: number;
    public latitude: number;
    public unavail_pattern: string; // for now "week:sat,sun,etc..." defaults mon-friday
    public user_type: Entities.UserType;

    @hasOne(IAgency, master => master.agencies)
    public agency_code: string;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getTimesheets(timesheets: Timesheet[]): Timesheet[] {
        return timesheets.filter(ts => this.id === ts.user_id);
    }

    @hasMany
    public getCapabilities(capabilities: ICapability[]): ICapability[] {
        return capabilities.filter(c => c.user_id === this.id);
    }

    @hasMany
    public getAvailabilityEvents(availabilityEvents: IAvailabilityEvent[]): IAvailabilityEvent[] {
        return availabilityEvents.filter(av => av.user_id === this.id);
    }

    @hasMany
    public getAssignments(assignments: IAssignment[]): IAssignment[] {
        return assignments.filter(ass => ass.user_id === this.id);
    }


    public getBirthDate(): Date { return (!!this.birth_date) ? new Date(this.birth_date) : null; }
    public setBirthDate(date: Date) { this.birth_date = !!date ? date.toISOString() : null; }
    public getDistance(lat: number, long: number): number {
        if (!this.longitude || !this.latitude) return null;
        return Math.sqrt((lat - this.latitude) ** 2 + (long - this.longitude) ** 2);
    }

}

/** A calendar event based indicating not available */
export class IAvailabilityEvent extends BaseEntity implements Entities.IAvailabilityEvent {
    public name: string;
    public start_date: string;
    public days: number;

    @hasOne(IAssignment, master => master.assignments)
    public assignment_id: string;

    @hasOne(IJobRequirement, master => master.jobRequirements)
    public job_requirement_id: string;

    @hasOne(IUser, master => master.users)
    public user_id: string;

    @hasMany
    public getTimesheets(timesheets: Timesheet[]): Timesheet[] {
        return timesheets.filter(ts => ts.assignment_id === this.id);
    }

    @hasMany
    public getAvailabilityEvents(availabilityEvents: IAvailabilityEvent[]): IAvailabilityEvent[] {
        return availabilityEvents.filter(ae => ae.assignment_id === this.id);
    }

    /** Start Date taken of the event */
    public getStartDate(): Date { return (!!this.start_date) ? new Date(this.start_date) : null; }
    public setStartDate(date: Date) { this.start_date = !!date ? date.toISOString() : null; }
    public getEndDate(): Date {
        let startDate = this.start_date;
        if (!!startDate) return Moment(startDate).add(this.days, "days").toDate();
        return null;
    }
}

export class ISite extends BaseEntity implements Entities.ISite {
    public name: string;
    public site_code: string;
    public department_code: string;
    public address_street: string;
    public address_town: string;
    public address_area: string;
    public address_country: string;
    public post_code: string;
    public longitude: number;
    public latitude: number;
    public business_type: Entities.BusinessType;

    @hasOne(Client, master => master.clients)
    public client_id: string;

    @hasOne(IUser, master => master.users)
    public owner_id: string;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getProjects(projects: IProject[]): IProject[] {
        return projects.filter(p => p.site_id === this.id);
    }
}

export class IUserSite extends BaseEntity implements Entities.IUserSite {

    @hasOne(IUser, master => master.users)
    public user_id: string;

    @hasOne(ISite, master => master.sites)
    public site_id: string;

    public distance_miles: number;

    constructor(seed: any) { super(seed); }
}


export class IProject extends BaseEntity implements Entities.IProject {
    public name: string;
    public annual: boolean;
    public end_date: string;
    public start_date: string;
    public jobs: IJob[];
    public project_code: string;
    public description: string;
    public customer_name: string;

    @hasOne(Client, master => master.clients)
    public client_id: string;

    @hasOne(ISite, master => master.sites)
    public site_id: string;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getJobs(jobs: IJob[]): IJob[] {
        return jobs.filter(j => j.project_id === this.id);
    }

    /** Returns the next job starting after the specified date */
    public getNextJobStarting(jobs: IJob[], from: Date): IJob {
        jobs = jobs || [];
        let future = jobs.filter(j => j.getEffectiveStartDate(this) >= from);
        return minBy(future, j => j.getEffectiveStartDate(this));
    }
    /** Returns the next job ending after the specified date */
    public getNextJobEnding(jobs: IJob[], from: Date): IJob {
        jobs = jobs || [];
        let future = jobs.filter(j => j.getEffectiveEndDate(this) >= from);
        return minBy(future, j => j.getEffectiveEndDate(this));
    }
    public getStartDate(): Date { return (!!this.start_date) ? Moment(new Date(this.start_date)).utc().toDate() : null; }
    public setStartDate(date: Date) { this.start_date = !!date ? Moment(date).utc().toISOString() : null; }
    public getEndDate(): Date { return (!!this.end_date) ? Moment(new Date(this.end_date)).utc().toDate() : null; }
    public setEndDate(date: Date) { this.end_date = !!date ? Moment(date).utc().toISOString() : null; }

    public getEarliestJobStart(jobs: IJob[]): Date {
        return minBy(jobs, j => j.getEffectiveStartDate(this)).getEffectiveStartDate(this);
    }
    public getLatestJobEnd(jobs: IJob[]): Date {
        return maxBy(jobs, j => j.getEffectiveEndDate(this)).getEffectiveEndDate(this);
    }
}


export class IContract extends BaseEntity implements Entities.IContract {
    public start_date: string;
    public end_date: string;
    public worker_user_id: string;
    public client_owned_contract_code: string;
    public agency_owned_contract_code: string;
    public client_owned_user_code: string;
    public agency_owned_user_code: string;
    public vendor_agreement_id: string;

    @hasOne(Client, master => master.clients)
    public client_id: string;

    @hasOne(IAgency, master => master.agencies)
    public agency_id: string;

    constructor(seed: any) { super(seed); }
}


export class IJob extends BaseEntity implements Entities.IJob {
    public name: string;
    public start_offset_days: number;
    public days: number;
    public client_job_code: string;
    public agency_job_code: string;

    @hasOne(IProject, master => master.projects)
    public project_id: string;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getJobRequirements(jobRequirements: IJobRequirement[]): IJobRequirement[] {
        return jobRequirements.filter(jr => jr.job_id === this.id);
    }

    @hasMany
    public getTimesheets(timesheets: Timesheet[]): Timesheet[] {
        return timesheets.filter(ts => ts.job_id === this.id);
    }

    public getProject(projects: Dict<IProject>, fn: (project: IProject) => any): any {
        if (fn && projects[this.project_id]) return fn(projects[this.project_id]);
        return projects[this.project_id];
    }


    public getEffectiveStartDate(project: IProject): Date {
        let projectStartDate = project.getStartDate();
        return Moment(projectStartDate).utc().add(this.start_offset_days || 0, "days").toDate();
    }
    /** The length of the job, defaulting to the length of the project using the Effective Start Date of the job */
    public getEffectiveDays(project: IProject): number {
        return this.days || (Moment(project.getEndDate()).diff(Moment(this.getEffectiveStartDate(project)), "days") + 1);
    }
    /** The end date of the job taking the Effective Start Date and Effective Length (defaulting to the project) */
    public getEffectiveEndDate(project: IProject): Date {
        return Moment(this.getEffectiveStartDate(project)).add(this.getEffectiveDays(project) - 1, "days").toDate();
    }
}

export class IJobRequirement extends BaseEntity implements Entities.IJobRequirement {
    public resources: number;
    public start_offset_days: number;
    public grade_level: number;
    public accreditation: "NAECI";
    public days: number;

    @hasOne(IQualification, master => master.qualifications)
    public qualification_id: string;

    @hasOne(IJob, master => master.jobs)
    public job_id: string;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getAssignments(assignments: IAssignment[]): IAssignment[] {
        return assignments.filter(ass => ass.job_requirement_id === this.id);
    }

    public getJob(jobs: Dict<IJob>, fn: (job: IJob) => any): any {
        if (fn && jobs[this.job_id]) return fn(jobs[this.job_id]);
        return jobs[this.job_id];
    }


    public getEffectiveStartDate(job: IJob, project: IProject): Date {
        return Moment(job.getEffectiveStartDate(project))
            .add((this.start_offset_days || 0), "days")
            .toDate();
    }
    /** The length of the job, defaulting to the length of the project using the Effective Start Date of the job */
    public getEffectiveDays(job: IJob, project: IProject): number {
        return this.days || job.getEffectiveDays(project);
    }
    /** The end date of the job taking the Effective Start Date and Effective Length (defaulting to the project) */
    public getEffectiveEndDate(job: IJob, project: IProject): Date {
        return Moment(this.getEffectiveStartDate(job, project)).add(this.getEffectiveDays(job, project), "days").toDate();
    }

}

export class ICapability extends BaseEntity implements Entities.ICapability {
    public expires: string;
    public grade_level: number;
    public accreditation: "NAECI";
    public valid_from: string;
    public verified: boolean;

    @hasOne(IUser, master => master.users)
    public user_id: string;

    @hasOne(IQualification, master => master.qualifications)
    public qualification_id: string;

    @hasOne(IUser, master => master.users)
    public signed_off_user_id: string;

    constructor(seed: any) { super(seed); }

    public getQualification(qualifications: Dict<IQualification>): IQualification;
    public getQualification(qualifications: Dict<IQualification>, fn: (qualification: IQualification) => string): string;
    public getQualification(qualifications: Dict<IQualification>, fn: (qualification: IQualification) => string = null): IQualification | string {
        if (!fn) return qualifications[this.qualification_id];
        else {
            let qual = qualifications[this.qualification_id];
            if (!!qual) return fn(qual);
        }
        return null;
    }


    public getValidFrom(): Date { return (!!this.valid_from) ? new Date(this.valid_from) : null; }
    public setValidFrom(date: Date) { this.valid_from = !!date ? date.toISOString() : null; }
}

export class IAssignment extends BaseEntity implements Entities.IAssignment {
    /** Can be "open", "rejected", "accepted", "canceled", "closed" */
    public state: "draft" | "open" | "rejected" | "accepted" | "canceled" | "closed";
    public request_expires: string;
    /** Immutable duration taken from project or job. If job rescheduled then a new assignment is created. */
    public days: number;
    /** Immutable start date taken from project or job. If job is rescheduled we"ll create a new assignment. */
    public start_date: string;
    public name: string;
    public client_user_code: string;

    @hasOne(IUser, master => master.users)
    public user_id: string;

    @hasOne(IJobRequirement, master => master.jobRequirements, "requirement")
    public job_requirement_id: string;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getAvailabilityEvents(availabilityEvents: IAvailabilityEvent[]): IAvailabilityEvent[] {
        return availabilityEvents.filter(av => av.assignment_id === this.id);
    }

    @hasMany
    public getTimesheets(timesheets: Timesheet[]): Timesheet[] {
        return timesheets.filter(ts => ts.assignment_id === this.id);
    }

    public getJobRequirement(requirements: Dict<IJobRequirement>, fn: (req: IJobRequirement) => any): any {
        if (fn && requirements[this.job_requirement_id]) return fn(requirements[this.job_requirement_id]);
        return requirements[this.job_requirement_id];
    }

    public getRequestExpires(): Date { return (!!this.request_expires) ? new Date(this.request_expires) : null; }
    public setRequestExpires(date: Date) { this.request_expires = !!date ? date.toISOString() : null; }
    public getStartDate(): Date { return (!!this.start_date) ? new Date(this.start_date) : null; }
    public setStartDate(date: Date) { this.start_date = !!date ? date.toISOString() : null; }

    /** Calculated end date based on start_date and days */
    public getEndDate(): Date {
        let startDate = this.getStartDate();
        return (!!startDate) ? Moment(startDate).add(this.days, "days").toDate() : null;
    }
}

export class IQualification extends BaseEntity implements Entities.IQualification {
    public short_name: string;
    public name: string;
    public graded: boolean;
    public duration_months: number;

    constructor(seed: any) { super(seed); }

    @hasMany
    public getCapabilities(capabilities: ICapability[]): ICapability[] {
        return capabilities.filter(c => c.qualification_id === this.id);
    }

    @hasMany
    public getJobRequirements(jobRequirements: IJobRequirement[]): IJobRequirement[] {
        return jobRequirements.filter(jr => jr.qualification_id === this.id);
    }
}

export class Vendor extends BaseEntity implements Entities.IVendor {
    public client_contact: string;
    public agency_contact: string;
    public start_date: string;
    public end_date: string;
    public agency_owned_client_code: string;
    public client_owned_client_code: string;
    public client_owned_agency_code: string;
    public agency_owned_agency_code: string;

    @hasOne(Client, master => master.clients)
    public client_id: string;

    @hasOne(IAgency, master => master.agencies)
    public agency_id: string;

    constructor(seed: any) { super(seed); }
}

export class Client extends BaseEntity implements Entities.IClient {
    @hasOne(IUser, master => master.users)
    public primary_user_id: string;
    public name: string;
    constructor(seed: any) { super(seed); }

    @hasMany
    public getProjects(projects: IProject[]): IProject[] {
        return projects.filter(p => p.client_id === this.id);
    }

    @hasMany
    public getSites(sites: ISite[]): ISite[] {
        return sites.filter(s => s.client_id === this.id);
    }
}

export class IAgency extends BaseEntity implements Entities.IAgency {
    public name: string;

    @hasOne(IUser, masters => masters.users)
    public primary_user_id: string;

    constructor(seed: any) { super(seed); }
}

export class Timesheet extends BaseEntity implements Entities.ITimesheet {
    public date: string;
    public client_user_code: string;
    public week_number: number;
    public financial_year: number;
    public day_of_week: number;
    public price: number;
    public hours: number;
    public rate: number;
    public entry_type: Entities.EntryType;
    public total: number;
    public start_time_hours: number;
    public end_time_hours: number;
    public break_duration_hours: number;
    public expense_description: string;

    @hasOne(IUser, master => master.users)
    public user_id: string;

    @hasOne(ISite, master => master.sites)
    public site_id: string;

    @hasOne(IJob, master => master.jobs)
    public job_id: string;

    @hasOne(IAssignment, master => master.assignments)
    public assignment_id: string;

    constructor(seed: any) { super(seed); }
}
