import { Bubble } from "react-native-gifted-chat";

const renderCustomBubble = (props) => {
  const { currentMessage } = props;
  const isUser = currentMessage.user._id === 1;

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: COLORS.userBubble,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 4,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        },
        left: {
          backgroundColor: COLORS.botBubble,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 4,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },
      }}
      textStyle={{
        right: {
          color: COLORS.userText,
          fontFamily: FONTS.regular,
        },
        left: {
          color: COLORS.botText,
          fontFamily: FONTS.regular,
        },
      }}
      bottomContainerStyle={{
        right: { borderColor: "transparent" },
        left: { borderColor: "transparent" },
      }}
    />
  );
};

export default renderCustomBubble;
