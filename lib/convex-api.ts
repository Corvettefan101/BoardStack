// Mock Convex API that works in the browser environment
export const api = {
  users: {
    signup: "users:signup" as any,
    login: "users:login" as any,
    updateProfile: "users:updateProfile" as any,
    changePassword: "users:changePassword" as any,
    deleteAccount: "users:deleteAccount" as any,
    getUser: "users:getUser" as any,
  },
  boards: {
    getBoards: "boards:getBoards" as any,
    createBoard: "boards:createBoard" as any,
    updateBoard: "boards:updateBoard" as any,
    deleteBoard: "boards:deleteBoard" as any,
    inviteMember: "boards:inviteMember" as any,
    removeMember: "boards:removeMember" as any,
  },
  columns: {
    createColumn: "columns:createColumn" as any,
    updateColumn: "columns:updateColumn" as any,
    deleteColumn: "columns:deleteColumn" as any,
    reorderColumns: "columns:reorderColumns" as any,
  },
  cards: {
    createCard: "cards:createCard" as any,
    updateCard: "cards:updateCard" as any,
    moveCard: "cards:moveCard" as any,
    deleteCard: "cards:deleteCard" as any,
    reorderCards: "cards:reorderCards" as any,
  },
  tags: {
    getUserTags: "tags:getUserTags" as any,
    createTag: "tags:createTag" as any,
    addTagToCard: "tags:addTagToCard" as any,
    removeTagFromCard: "tags:removeTagFromCard" as any,
    deleteTag: "tags:deleteTag" as any,
  },
  migration: {
    migrateUserData: "migration:migrateUserData" as any,
  },
  activities: {
    getBoardActivities: "activities:getBoardActivities" as any,
    getUserActivities: "activities:getUserActivities" as any,
  },
  notifications: {
    getUserNotifications: "notifications:getUserNotifications" as any,
    markNotificationAsRead: "notifications:markNotificationAsRead" as any,
    markAllNotificationsAsRead: "notifications:markAllNotificationsAsRead" as any,
    deleteNotification: "notifications:deleteNotification" as any,
  },
}
