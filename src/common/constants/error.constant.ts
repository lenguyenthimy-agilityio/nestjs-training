export const ERROR_MESSAGE = {
  UNAUTHORIZED: 'Invalid credentials',
  PERMISSION_DENIED: 'You do not have permission to access this resource',
  USER_EXISTED: 'Email already exists',
  PRODUCT_EXISTED: 'Product with this name already exists',
  PRODUCT_NOT_FOUND: (productId: string) => `Product with id ${productId} not found`,
  USER_NOT_FOUND: (userId: string) => `User with ID ${userId} not found`,
  CART_ITEM_NOT_FOUND: 'Cart item not found',
};
