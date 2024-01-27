const userApp = require("../app/user.app");

class Privacy {
    async RoleChecker(req , ...roles) {
        const role = await userApp.findRoleID(req.user.RoleID)
        if (!roles.includes(role.ID)) {
            return false;
        }
        else {
            return true;
        }

    }
};




module.exports = new Privacy