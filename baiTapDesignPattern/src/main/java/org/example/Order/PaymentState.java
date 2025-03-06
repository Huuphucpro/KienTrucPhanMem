package org.example.Order;

// Interface PaymentState - Đại diện cho một trạng thái thanh toán
public interface PaymentState {
    void handlePayment(double amount);
}

// Các trạng thái thanh toán cụ thể
class CashPaymentState implements PaymentState {
    public void handlePayment(double amount) {
        System.out.println("Thanh toan " + amount + " VND bang tien mat.");
    }
}

class BankTransferPaymentState implements PaymentState {
    public void handlePayment(double amount) {
        System.out.println("Thanh toan " + amount + " VND qua CKNH.");
    }
}

class MomoPaymentState implements PaymentState {
    public void handlePayment(double amount) {
        System.out.println("Thanh toan " + amount + " VND qua MoMo.");
    }
}

class VNPayPaymentState implements PaymentState {
    public void handlePayment(double amount) {
        System.out.println("Thanh toan " + amount + " VND qua VN Pay.");
    }
}

// Context - Quản lý trạng thái thanh toán
class PaymentContext {
    private PaymentState currentState;

    public void setPaymentState(PaymentState state) {
        this.currentState = state;
    }

    public void pay(double amount) {
        if (currentState == null) {
            throw new IllegalStateException("Chua chon phuong thuc thanh toan.");
        }
        currentState.handlePayment(amount);
    }
}

