const permissions = {
    USER_CREATE_UPDATE: 'user:create:update',
    USER_READ: 'user:read',
    USER_DELETE: 'user:delete',

    HISTORY_VIEW: 'history:view',
    HISTORY_DELETE: 'history:delete',

    CAMERA_VIEW_LIVE: 'camera:view:live',

    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',
};

const roles = {
    ADMIN: 'Admin',
    SUPERVISOR: 'Supervisor',
    OPERATOR: 'Operator',
    VIEWER: 'Viewer'
};

const rolePermissions = {
    [roles.ADMIN]: Object.values(permissions),
    [roles.SUPERVISOR]: [
        permissions.USER_CREATE_UPDATE,
        permissions.USER_READ,
        permissions.USER_DELETE,
        permissions.HISTORY_VIEW,
        permissions.HISTORY_DELETE,
        permissions.SETTINGS_VIEW,
        permissions.SETTINGS_EDIT
    ],
    [roles.OPERATOR]: [
        permissions.HISTORY_VIEW,
        permissions.CAMERA_VIEW_LIVE,

        permissions.USER_READ
    ],
    [roles.VIEWER]: [
        permissions.CAMERA_VIEW_LIVE
    ]
};

module.exports = {
    permissions,
    roles,
    rolePermissions
};