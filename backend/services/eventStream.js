/**
 * EasyCoin Real-Time Event Stream Service (Server-Sent Events)
 * Provides ultra-lightweight, resilient push updates between Senior and Guardian.
 */
class EventStreamService {
  constructor() {
    this.clients = new Set();
  }

  // Register an HTTP client for SSE streaming
  registerClient(req, res, role = 'senior') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const client = {
      id: Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      role,
      res
    };

    this.clients.add(client);

    // Initial heartbeat and connection confirmation
    this.sendToClient(client, 'CONNECTED', {
      clientId: client.id,
      role: client.role,
      timestamp: new Date().toISOString()
    });

    req.on('close', () => {
      this.clients.delete(client);
    });
  }

  // Send structured SSE packet to a specific client
  sendToClient(client, eventType, data) {
    try {
      client.res.write(`event: ${eventType}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      this.clients.delete(client);
    }
  }

  // Broadcast event to all subscribers or targeted by role
  broadcast(eventType, data, targetRole = null) {
    for (const client of this.clients) {
      if (!targetRole || client.role === targetRole || targetRole === 'all') {
        this.sendToClient(client, eventType, data);
      }
    }
  }

  // Specific high-level event helpers
  notifyGuardianApprovalRequired(ping) {
    this.broadcast('APPROVAL_REQUESTED', {
      pingId: ping.pingId,
      amount: ping.amount,
      recipientName: ping.recipientName,
      timestamp: ping.timestamp,
      message: `Transfer of ₹${ping.amount} to ${ping.recipientName} requires your guardian authorization.`
    });
  }

  notifyTransferResolved(ping, approved) {
    this.broadcast('TRANSFER_RESOLVED', {
      pingId: ping.pingId,
      approved,
      amount: ping.amount,
      recipientName: ping.recipientName,
      status: approved ? 'APPROVED' : 'REJECTED',
      message: approved
        ? `Transfer of ₹${ping.amount} to ${ping.recipientName} has been approved by your guardian!`
        : `Transfer of ₹${ping.amount} to ${ping.recipientName} was declined by your guardian.`
    });
  }

  notifySOSAlert(sosData) {
    this.broadcast('EMERGENCY_SOS_ALERT', {
      alertType: 'SOS',
      timestamp: new Date().toISOString(),
      ...sosData
    });
  }

  notifyAccountStateChanged(isFrozen) {
    this.broadcast('ACCOUNT_STATE_CHANGED', {
      isFrozen,
      timestamp: new Date().toISOString()
    });
  }

  notifyBalanceUpdated(balance) {
    this.broadcast('BALANCE_UPDATED', {
      balance,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new EventStreamService();
