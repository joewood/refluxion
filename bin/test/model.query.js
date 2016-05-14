"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var query_1 = require("./query");
var normalizr_1 = require("normalizr");
var ModelMasterQuery = (function (_super) {
    __extends(ModelMasterQuery, _super);
    function ModelMasterQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return ModelMasterQuery;
}(query_1.Query));
exports.ModelMasterQuery = ModelMasterQuery;
var IUserQuery = (function (_super) {
    __extends(IUserQuery, _super);
    function IUserQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IUserQuery;
}(query_1.Query));
exports.IUserQuery = IUserQuery;
var IAvailabilityEventQuery = (function (_super) {
    __extends(IAvailabilityEventQuery, _super);
    function IAvailabilityEventQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IAvailabilityEventQuery;
}(query_1.Query));
exports.IAvailabilityEventQuery = IAvailabilityEventQuery;
var ISiteQuery = (function (_super) {
    __extends(ISiteQuery, _super);
    function ISiteQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return ISiteQuery;
}(query_1.Query));
exports.ISiteQuery = ISiteQuery;
var IUserSiteQuery = (function (_super) {
    __extends(IUserSiteQuery, _super);
    function IUserSiteQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IUserSiteQuery;
}(query_1.Query));
exports.IUserSiteQuery = IUserSiteQuery;
var IProjectQuery = (function (_super) {
    __extends(IProjectQuery, _super);
    function IProjectQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IProjectQuery;
}(query_1.Query));
exports.IProjectQuery = IProjectQuery;
var IContractQuery = (function (_super) {
    __extends(IContractQuery, _super);
    function IContractQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IContractQuery;
}(query_1.Query));
exports.IContractQuery = IContractQuery;
var IJobQuery = (function (_super) {
    __extends(IJobQuery, _super);
    function IJobQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IJobQuery;
}(query_1.Query));
exports.IJobQuery = IJobQuery;
var IJobRequirementQuery = (function (_super) {
    __extends(IJobRequirementQuery, _super);
    function IJobRequirementQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IJobRequirementQuery;
}(query_1.Query));
exports.IJobRequirementQuery = IJobRequirementQuery;
var ICapabilityQuery = (function (_super) {
    __extends(ICapabilityQuery, _super);
    function ICapabilityQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return ICapabilityQuery;
}(query_1.Query));
exports.ICapabilityQuery = ICapabilityQuery;
var IAssignmentQuery = (function (_super) {
    __extends(IAssignmentQuery, _super);
    function IAssignmentQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IAssignmentQuery;
}(query_1.Query));
exports.IAssignmentQuery = IAssignmentQuery;
var IQualificationQuery = (function (_super) {
    __extends(IQualificationQuery, _super);
    function IQualificationQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IQualificationQuery;
}(query_1.Query));
exports.IQualificationQuery = IQualificationQuery;
var VendorQuery = (function (_super) {
    __extends(VendorQuery, _super);
    function VendorQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return VendorQuery;
}(query_1.Query));
exports.VendorQuery = VendorQuery;
var ClientQuery = (function (_super) {
    __extends(ClientQuery, _super);
    function ClientQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return ClientQuery;
}(query_1.Query));
exports.ClientQuery = ClientQuery;
var IAgencyQuery = (function (_super) {
    __extends(IAgencyQuery, _super);
    function IAgencyQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return IAgencyQuery;
}(query_1.Query));
exports.IAgencyQuery = IAgencyQuery;
var TimesheetQuery = (function (_super) {
    __extends(TimesheetQuery, _super);
    function TimesheetQuery(primitives, nested, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested);
    }
    return TimesheetQuery;
}(query_1.Query));
exports.TimesheetQuery = TimesheetQuery;
modelMaster.define({});
user.define({
    timesheets: normalizr_1.arrayOf(timesheet),
    capabilities: normalizr_1.arrayOf(capability),
    availabilityEvents: normalizr_1.arrayOf(availabilityEvent),
    assignments: normalizr_1.arrayOf(assignment),
    agency: agency,
});
availabilityEvent.define({
    timesheets: normalizr_1.arrayOf(timesheet),
    availabilityEvents: normalizr_1.arrayOf(availabilityEvent),
    assignment: assignment,
    job_requirement: jobRequirement,
    user: user,
});
site.define({
    projects: normalizr_1.arrayOf(project),
    client: client,
    owner: user,
});
userSite.define({
    user: user,
    site: site,
});
project.define({
    jobs: normalizr_1.arrayOf(job),
    client: client,
    site: site,
});
contract.define({
    client: client,
    agency: agency,
});
job.define({
    jobRequirements: normalizr_1.arrayOf(jobRequirement),
    timesheets: normalizr_1.arrayOf(timesheet),
    project: project,
});
jobRequirement.define({
    assignments: normalizr_1.arrayOf(assignment),
    qualification: qualification,
    job: job,
});
capability.define({
    user: user,
    qualification: qualification,
    signed_off_user: user,
});
assignment.define({
    availabilityEvents: normalizr_1.arrayOf(availabilityEvent),
    timesheets: normalizr_1.arrayOf(timesheet),
    user: user,
    requirement: jobRequirement,
});
qualification.define({
    capabilities: normalizr_1.arrayOf(capability),
    jobRequirements: normalizr_1.arrayOf(jobRequirement),
});
vendor.define({
    client: client,
    agency: agency,
});
client.define({
    projects: normalizr_1.arrayOf(project),
    sites: normalizr_1.arrayOf(site),
    primary_user: user,
});
agency.define({
    primary_user: user,
});
timesheet.define({
    user: user,
    site: site,
    job: job,
    assignment: assignment,
});
//# sourceMappingURL=model.query.js.map