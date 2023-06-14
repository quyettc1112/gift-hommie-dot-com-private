import React, { useEffect } from "react";
import CheckoutDTO from "../../type/CheckoutDTO";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import Swal from "sweetalert2";

const rate = 1 / 23800;
const currency = "USD";
const style = { layout: "vertical" };

interface Props {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  checkoutData: CheckoutDTO;
  setCheckoutData: (data: CheckoutDTO) => void;
}
const CheckoutPaymentModal = ({
  isOpen,
  onOpen,
  onClose,
  checkoutData,
  setCheckoutData,
}: Props) => {
  let total = checkoutData.carts.reduce((acc, item) => acc + item.total, 0);
  let shippingFee = checkoutData.shippingFee ? checkoutData.shippingFee : 0;
  let sum = total + shippingFee;
  // PAYPAL handling

  return (
    <Modal isOpen={isOpen} onClose={onClose} preserveScrollBarGap={false}>
      <ModalOverlay />
      <ModalContent style={{ overflowY: "scroll", height: "90vh" }}>
        <ModalHeader>Thanh toán qua Paypal</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text
            fontSize="lg"
            textAlign="center"
            fontWeight="bold"
            mb="4"
            color="orange"
          >
            Click vào nút bên dưới để tiến hành thanh toán
          </Text>
          <PayPalScriptProvider
            options={{
              clientId:
                "ARoi3O0eCaY4PgNsrZxTJklW9GbaWekKLptBbN6PXhZ4US6fIYkInRUJ65X93zScKp1pyZSCLLqDTZqx",
            }}
          >
            <PayPalButtonWrapper
              amount={sum * rate}
              onClose={onClose}
              checkoutData={checkoutData}
            />
          </PayPalScriptProvider>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="red" variant="outline" mr={3} onClick={onClose}>
            Hủy
          </Button>
          {/* <Button variant="ghost">Secondary Action</Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const PayPalButtonWrapper = ({
  amount,
  onClose,
  checkoutData,
}: {
  amount: number;
  onClose: () => void;
  checkoutData: CheckoutDTO;
}) => {
  // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
  // This is the main reason to wrap the PayPalButtons in a new component
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  console.log(amount.toFixed(2));

  return (
    <PayPalButtons
      createOrder={(data, actions) => {
        return actions.order
          .create({
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: amount.toFixed(2),
                },
              },
            ],
          })
          .then((orderId) => {
            // Your code here after create the order
            return orderId;
          });
      }}
      onApprove={async (data, actions) => {
        const details = await actions.order?.capture();
        const name = details?.payer?.name?.given_name;
        // alert("Transaction completed by " + name);

        onClose();
        console.log("Thanh toán thành công đơn hàng", checkoutData);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Thanh toán thành công",
          showConfirmButton: false,
          timer: 1000,
        });
      }}
    />
  );
};

export default CheckoutPaymentModal;