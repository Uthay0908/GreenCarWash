package com.greencarwash.support.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greencarwash.support.dto.CreateTicketRequest;
import com.greencarwash.support.dto.TicketResponse;
import com.greencarwash.support.entity.TicketCategory;
import com.greencarwash.support.entity.TicketPriority;
import com.greencarwash.support.entity.TicketStatus;
import com.greencarwash.support.service.SupportTicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SupportController.class)
@AutoConfigureMockMvc(addFilters = false)
class SupportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SupportTicketService supportTicketService;

    @Test
    void createTicket_Success() throws Exception {
        CreateTicketRequest request = CreateTicketRequest.builder()
                .bookingId(10L)
                .category(TicketCategory.WASH_QUALITY)
                .priority(TicketPriority.HIGH)
                .subject("Spot missed on hood")
                .description("The hood was still dusty after wash.")
                .build();

        TicketResponse response = TicketResponse.builder()
                .id(1L)
                .ticketNumber("TKT-1234ABCD")
                .userId(1L)
                .userRole("ROLE_CUSTOMER")
                .category(TicketCategory.WASH_QUALITY)
                .status(TicketStatus.OPEN)
                .subject("Spot missed on hood")
                .build();

        when(supportTicketService.createTicket(eq(1L), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/support/tickets")
                        .header("X-User-Id", "1")
                        .header("X-User-Role", "ROLE_CUSTOMER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketNumber").value("TKT-1234ABCD"));
    }

    @Test
    void getMyTickets_Success() throws Exception {
        TicketResponse response = TicketResponse.builder()
                .id(1L)
                .ticketNumber("TKT-1234ABCD")
                .userId(1L)
                .build();

        when(supportTicketService.getMyTickets(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/support/tickets/my-tickets")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticketNumber").value("TKT-1234ABCD"));
    }
}
