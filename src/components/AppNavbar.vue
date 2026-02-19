<script setup>
import { computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/cart";

const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();

const isLoggedIn = computed(() => auth.isLoggedIn);
const isAdmin = computed(() => auth.isAdmin);

const cartCount = computed(() => {
  return (cart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
});

// Fetch cart whenever the user becomes logged in and is not admin
watchEffect(async () => {
  if (isLoggedIn.value && !isAdmin.value) {
    await cart.fetchCart();
  }
});

function logout() {
  auth.logout?.();
  router.push("/login");
}
</script>


<template>
  <nav class="navbar navbar-expand-lg py-3 navbar-light">
    <div class="container container-narrow">
      <router-link class="navbar-brand fw-semibold" to="/">Atelier Patisserie</router-link>

      <!-- Mobile toggle -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNavbar" class="collapse navbar-collapse">
        <div class="ms-auto d-flex flex-column flex-lg-row align-items-lg-center gap-2 mt-3 mt-lg-0">
          <router-link class="btn btn-ghost" to="/products">Products</router-link>

          <!-- ===== USER LINKS (NON-ADMIN) ===== -->
          <router-link
            v-if="isLoggedIn && !isAdmin"
            class="btn btn-ghost position-relative"
            to="/cart"
          >
            Cart
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </router-link>

          <router-link
            v-if="isLoggedIn && !isAdmin"
            class="btn btn-ghost"
            to="/settings/payments"
          >
            Wallet
          </router-link>

          <router-link
            v-if="isLoggedIn && !isAdmin"
            class="btn btn-ghost"
            to="/orders"
          >
            Orders
          </router-link>

          <router-link
            v-if="isLoggedIn && !isAdmin"
            class="btn btn-ghost"
            to="/address"
          >
            Delivery Address
          </router-link>

          <!-- ===== ADMIN LINKS ===== -->
          <router-link
            v-if="isLoggedIn && isAdmin"
            class="btn btn-ghost"
            to="/admin/products"
          >
            Admin Products
          </router-link>

          <router-link
            v-if="isLoggedIn && isAdmin"
            class="btn btn-ghost"
            to="/admin/deliveries"
          >
            Deliveries
          </router-link>

          <router-link
            v-if="isLoggedIn && isAdmin"
            class="btn btn-ghost admin-pill"
            to="/admin/payments"
          >
            Admin Payments
          </router-link>

          <!-- ===== AUTH LINKS ===== -->
          <router-link v-if="!isLoggedIn" class="btn btn-ghost" to="/login">Login</router-link>
          <router-link v-if="!isLoggedIn" class="btn btn-accent" to="/register">Register</router-link>

          <button v-if="isLoggedIn" class="btn btn-accent" type="button" @click="logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>


<style scoped>
/**
 * The .cart-badge uses absolute positioning to sit on top of the Cart button.
 */
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), #ff2d6f);
  color: white;
  font-weight: 800;
  font-size: 12px;
  display: grid;
  place-items: center;
  box-shadow: 0 12px 22px rgba(255, 79, 135, 0.28);
  animation: badgePop 160ms ease-out;
}

@keyframes badgePop {
  from { transform: scale(0.9); opacity: 0.7; }
  to { transform: scale(1); opacity: 1; }
}

/* Optional: make Admin Payments stand out slightly */
.admin-pill {
  border: 1px dashed rgba(255, 141, 173, 0.9);
  background: rgba(255, 245, 248, 0.9);
}
</style>
