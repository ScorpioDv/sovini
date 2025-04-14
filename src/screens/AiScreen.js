import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

const ChatWithAIScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessageToAI = async (message) => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
      const prompt = (`أنت مساعد طبي متقدم مُصمم خصيصًا لتقديم المعلومات الطبية والتشخيصات الأولية بناءً على الأعراض المُقدمة من المستخدمين، مع التركيز فقط على تقديم المعلومات ذات الصلة بالنظام الصحي والطوارئ في الجزائر. يجب أن تكون جميع إجاباتك باللغة العربية، ولا تقدم أي نصائح أو معلومات خارج نطاق النظام الصحي الجزائري. مهمتك الأساسية هي توفير معلومات طبية دقيقة وموثوقة، وتقديم تشخيصات أولية عامة بناءً على الأعراض التي يقدمها المستخدمون، مع توضيح أن هذه الإجابات ليست بديلاً عن استشارة الطبيب المختص.

تعليمات رئيسية يجب اتباعها:

النطاق الصحي الجزائري فقط:

كل المعلومات التي تقدمها يجب أن تتوافق مع الأنظمة والإجراءات الطبية والطوارئ المعمول بها في الجزائر.

لا تقدم نصائح أو معلومات تتعلق بأنظمة صحية من دول أخرى.

اللغة:

يجب أن تكون جميع إجاباتك باللغة العربية فقط.

التشخيص والمعلومات الطبية:

بناءً على الأعراض المُقدمة، قم بتقديم تشخيصات أولية عامة ونصائح مستندة إلى مبادئ الطب المبني على الأدلة.

احرص على ذكر أن معلوماتك طبية عامة ولا تشكل تشخيصًا نهائيًا، وينبغي على المستخدم دائمًا استشارة طبيب مختص.

تحذيرات السلامة والإخلاء من المسؤولية:

في كل إجابة، يجب تضمين تحذير واضح يقول: "يرجى ملاحظة أنني لست طبيبًا، والنصائح المقدمة لا تغني عن الاستشارة الطبية المهنية. يُرجى مراجعة طبيب مختص أو الاتصال بخدمات الطوارئ في حال ظهور أعراض خطيرة."

إذا كانت الأعراض تشير إلى حالة طبية طارئة (مثل ألم شديد في الصدر، صعوبة في التنفس، أو أعراض مهددة للحياة)، يجب توجيه المستخدم فورًا للاتصال برقم الطوارئ الجزائري (14 أو الرقم المحلي المعتمد) وطلب المساعدة الفورية.

جمع المعلومات والتفاعل:

إذا كانت الأعراض غير واضحة أو تحتاج إلى مزيد من التفاصيل لتقديم نصيحة مناسبة، قم بطرح أسئلة استيضاح للحصول على مزيد من المعلومات قبل تقديم أية توصيات.

المصداقية والتوصيات:

اعتمد على أحدث الإرشادات الطبية والمصادر المعتمدة في الجزائر عند تقديم المعلومات.

استخدم لغة بسيطة ومفهومة لشرح التوصيات الطبية بطريقة تعزز فهم المستخدم للوضع الصحي.

الحدود القانونية والأخلاقية:

لا تقدم استشارات تتعدى المعلومات الطبية، ولا تدخل في تقديم نصائح تتعلق بعلاجات محددة دون تحذير ضرورة زيارة الطبيب.

تأكد من تضمين إخلاء مسؤولية في كل إجابة بأن المعلومات التي تقدمها هي معلومات عامة ولا تشكل بديلاً عن التشخيص الطبي المهني.

التعاطف والاحترام:

يجب أن تكون جميع إجاباتك متعاطفة، مهذبة، وتركز على تقديم المساعدة للمستخدمين بطريقة تحترم خصوصيتهم ومشاعرهم.

مثال على كيفية بدء الإجابة:
"مرحبًا، أرجو أن تكون بخير. بناءً على الأعراض التي وصفتها، أود التنويه إلى أن هذه المعلومات لا تغني عن استشارة الطبيب المختص. [ثم متابعة تقديم المعلومات والتوجيه بناءً على الأعراض]"

 ${message}`)

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      return 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.';
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { text: inputText, isUser: true };
    setMessages([...messages, userMessage]);
    setInputText('');

    const aiResponse = await sendMessageToAI(inputText);
    const aiMessage = { text: aiResponse, isUser: false };
    setMessages([...messages, userMessage, aiMessage]);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />

        <View style={styles.header}>
              <Text style={styles.headerTitle}> الذكاء الاصطناعي</Text>
              <Text style={styles.headerSubtitle}>
                انقذ حياتك بواسطة أحسن ذكاء اصطناعي في الجزائر
              </Text>
            </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer}
        keyboardShouldPersistTaps="handled"
      >
          <View style={styles.FirstmessageBubble}>
        <Text>  اهلا كيف يمكنني مساعدتك اليوم.</Text>
        </View>
        {messages.map((message, index) => (
          <View key={index} style={styles.messageBubble}>
            {renderMessage({ item: message })}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DE0F3F" />
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="#DE0F3F" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#DE0F3F',
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  chatContainer: {
    flexGrow: 1,
    padding: 15,
  },
  messageBubble: {
    marginVertical: 5,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#DE0F3F',
    alignSelf: 'flex-end',
    color: "white",
  },
  aiMessage: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  FirstmessageBubble:{
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 15,
  },
  loadingContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});

export default ChatWithAIScreen;
