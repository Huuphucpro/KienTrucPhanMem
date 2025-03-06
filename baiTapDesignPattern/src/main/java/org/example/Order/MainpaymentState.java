package org.example.Order;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class MainpaymentState {
    public static void main(String[] args) {
        PaymentContext paymentContext = new PaymentContext();

        // Chuyển đổi trạng thái thanh toán
        paymentContext.setPaymentState(new CashPaymentState());
        paymentContext.pay(500000);

        paymentContext.setPaymentState(new BankTransferPaymentState());
        paymentContext.pay(1000000);

        paymentContext.setPaymentState(new MomoPaymentState());
        paymentContext.pay(200000);

        paymentContext.setPaymentState(new VNPayPaymentState());
        paymentContext.pay(300000);
    }
}