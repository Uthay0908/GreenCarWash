package com.greencarwash.watermonitor.config;

import com.greencarwash.common.events.RabbitMQConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange waterExchange() {
        return new TopicExchange(RabbitMQConstants.WATER_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(RabbitMQConstants.BOOKING_EXCHANGE, true, false);
    }

    @Bean
    public Queue waterQueue() {
        return QueueBuilder.durable(RabbitMQConstants.WATER_QUEUE).build();
    }

    @Bean
    public Binding bookingServiceCompletedBinding(Queue waterQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(waterQueue).to(bookingExchange).with(RabbitMQConstants.RK_SERVICE_COMPLETED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
