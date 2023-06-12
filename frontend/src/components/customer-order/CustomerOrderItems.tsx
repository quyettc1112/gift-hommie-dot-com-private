import {
  Box,
  Card,
  HStack,
  VStack,
  Badge,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  List,
  ListItem,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import CheckoutBillList, {
  CheckoutBillItem,
} from "../checkout/CheckoutBillList";
import { GLOBAL_CONTEXT } from "../../App";
import CartDTO from "../../type/CartDTO";
import CustomerOrderItem from "./CustomerOrderItem";
import useFetchCart, { CartQuery } from "../../hooks/useFetchCart";

const CustomerOrderItems = () => {
  //CODE FAKE DATA (TEMPORARY)
  const [cartQuery, setCartQuery] = useState({} as CartQuery);
  const { carts, pageable, setCarts } = useFetchCart(cartQuery);
  // GET DATA
  let items = carts;
  return (
    <Box w="100%">
      <Card paddingX="8" paddingY="4" border="1px solid lightblue">
        <VStack>
          <HStack w="100%" justifyContent={"space-between"}>
            <Badge fontSize="md">Cập nhật: 17:59 06/06/2023</Badge>
            <Badge fontSize="md" colorScheme="yellow" bg="yellow.200">
              PENDING | Chờ xác nhận
            </Badge>
          </HStack>

          <VStack spacing={"4"} w="100%">
            {items.map((item) => {
              return <CustomerOrderItem item={item} />;
            })}
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
};

export default CustomerOrderItems;
