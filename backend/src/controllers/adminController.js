export { adminDashboard } from './admin/dashboardController.js'

export {
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  adminUpdateBookCover,
  adminToggleBookFeatured
} from './admin/booksController.js'

export {
  adminCreateAuthor,
  adminUpdateAuthor,
  adminDeleteAuthor,
  adminUpdateAuthorPhoto,
  adminToggleAuthorFeatured
} from './admin/authorsController.js'

export {
  adminListOrders,
  adminGetOrderById,
  adminUpdateOrderStatus
} from './admin/ordersController.js'

export {
  adminListReviews,
  adminDeleteReview,
  adminEditReview
} from './admin/reviewsController.js'

export {
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminToggleUserBlock,
  adminUpdateUserRole
} from './admin/usersController.js'
