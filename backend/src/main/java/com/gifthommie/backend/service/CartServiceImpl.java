package com.gifthommie.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.gifthommie.backend.dto.APIPageableResponseDTO;
import com.gifthommie.backend.entity.Cart;
import com.gifthommie.backend.entity.OrderDetail;
import com.gifthommie.backend.entity.Orders;
import com.gifthommie.backend.entity.Product;
import com.gifthommie.backend.repository.CartRepository;
import com.gifthommie.backend.repository.OrderRepository;
import com.gifthommie.backend.repository.ProductRepository;

@Service
public class CartServiceImpl implements CartService {
	@Autowired
	CartRepository cartRepository;
	@Autowired
	OrderRepository orderRepository;
	@Autowired
	ProductRepository productRepository;

	private final String[] CANCEL_STATUS_LIST = {"CANCELLED", "FAIL", "REFUSED"};

	@Override
	public Cart getCartByEmailAndProductId(String email, int productId) {
		return cartRepository.findCartByEmailAndProductId(email, productId);
	}

	@Override
	public Cart save(Cart cart) {
		// SET LOCALTIME
		cart.setLastTimeUpdate(LocalDateTime.now());

		// BEFORE SAVE CART, REFRESH CART
		cart = refreshCart(cart);

		return cartRepository.save(cart);
	}

	@Override
	public APIPageableResponseDTO<Cart> getPagableCart(Integer pageNo, Integer pageSize, String email) {
		Page<Cart> page = cartRepository.findAllByEmail(email, PageRequest.of(pageNo, pageSize));
		return new APIPageableResponseDTO<Cart>(page);
	}

	@Override
	public Cart getCartByEmailAndCartId(String emai, int cartId) {
		return cartRepository.findCartByEmailAndCartId(emai, cartId);
	}

	@Override
	public boolean deleteCart(String email, int productId) {
		Cart c = cartRepository.findCartByEmailAndProductId(email, productId);
		cartRepository.delete(c);
		return true;
	}

	private int getMaxNumber(int x, int y) {
		return (x < y) ? y : x;
	}

	private int getMinNumber(int x, int y) {
		return (x < y) ? x : y;
	}

	@Override
	public int getShopAvailableQuantity(int productId) {
		Product product = productRepository.findProductById(productId, true);
		// GET PRODUCT QUANTITY THAT ORDERED WITHOUT CANCEL
		Integer orderedQuantity = orderRepository.getOrderedProductQuantityWithoutStatus(productId, CANCEL_STATUS_LIST);
		// SHOP AVAILABLE QUANTITY = PRODUCT QUANTITY - ORDERED QUANTITY
		return product.getQuantity() - orderedQuantity;
	}

	@Override
	public int getCustomerAvailableQuantity(String email, int productId) {
		Cart cart = cartRepository.findCartByEmailAndProductId(email, productId);
		int cartQuantity = (cart == null) ? 0 : cart.getQuantity();

		return getMaxNumber(0, getShopAvailableQuantity(productId) - cartQuantity);
	}

	// RESET All CART DATABASE
	public void refreshAllCartByEmail(String email) {
		List<Cart> cartList = cartRepository.findAllByEmail(email);

		for (Cart cart : cartList) {
			Cart refreshedCart = refreshCart(cart);

			cartRepository.save(refreshedCart);
		}
	}

	// REFRESH A CART
	@Override
	public Cart refreshCart(Cart cart) {
		int shopAvailableQuantity = getShopAvailableQuantity(cart.getProduct().getId());

		cart.setQuantity(getMinNumber(shopAvailableQuantity, cart.getQuantity()));

		return cart;
	}

}
