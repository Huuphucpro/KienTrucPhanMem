package org.example.Order.Strategy;

// Interface PaymentStrategy - Định nghĩa phương thức thanh toán
public interface PaymentStrategy {
    void pay(double amount);
}

// Các phương thức thanh toán cụ thể
class CashPayment implements PaymentStrategy {
    public void pay(double amount) {
        System.out.println("Thanh toán " + amount + " VND bằng tiền mặt.");
    }
}

class BankTransferPayment implements PaymentStrategy {
    public void pay(double amount) {
        System.out.println("Thanh toán " + amount + " VND qua Chuyển Khoản Ngân Hàng.");
    }
}

class MomoPayment implements PaymentStrategy {
    public void pay(double amount) {
        System.out.println("Thanh toán " + amount + " VND qua MoMo.");
    }
}

class VNPayPayment implements PaymentStrategy {
    public void pay(double amount) {
        System.out.println("Thanh toán " + amount + " VND qua VN Pay.");
    }
}

// Context - Xử lý thanh toán theo phương thức được chọn
class PaymentContext {
    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void executePayment(double amount) {
        if (paymentStrategy == null) {
            throw new IllegalStateException("Chưa chọn phương thức thanh toán.");
        }
        paymentStrategy.pay(amount);
    }
}

