import React, { useState, useEffect } from 'react';
import './App.css';  

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState(localStorage.getItem('groupBy') || 'status');
  const [sortBy, setSortBy] = useState(localStorage.getItem('sortBy') || 'priority');  // Default to sorting by priority
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    priority: '1',
    status: 'Todo',
    userId: '',
  });

  const priorityMap = {
    4: 'Urgent',
    3: 'High',
    2: 'Medium',
    1: 'Low',
    0: 'No priority'
  };

  // API
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        'https://api.quicksell.co/v1/internal/frontend-assignment'
      );
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    };
    fetchData();
  }, []);

  //  Group By and Sort By to localStorage
  const handleSortByChange = (newSortBy) => {
    setSortBy(newSortBy);
    localStorage.setItem('sortBy', newSortBy);  // sortBy to localStorage
  };

  const handleGroupByChange = (newGroupBy) => {
    setGroupBy(newGroupBy);
    localStorage.setItem('groupBy', newGroupBy);  //  groupBy to localStorage
  };

  // new ticket
  const handleAddTicket = () => {
    const ticket = {
      id: `CAM-${tickets.length + 1}`, // Generate ID
      title: newTicket.title,
      priority: parseInt(newTicket.priority),
      status: newTicket.status,
      userId: newTicket.userId,
      tag: ['Feature Request'],
    };

    setTickets([...tickets, ticket]);
    setShowModal(false);
  };

  // Group tickets based on the selected criteria
  const groupTickets = (tickets, groupBy) => {
    switch (groupBy) {
      case 'status':
        return tickets.reduce((groups, ticket) => {
          const status = ticket.status;
          if (!groups[status]) {
            groups[status] = [];
          }
          groups[status].push(ticket);
          return groups;
        }, {});
      case 'user':
        return tickets.reduce((groups, ticket) => {
          const user = users.find((user) => user.id === ticket.userId)?.name || 'Unknown User';
          if (!groups[user]) {
            groups[user] = [];
          }
          groups[user].push(ticket);
          return groups;
        }, {});
      case 'priority':
        return tickets.reduce((groups, ticket) => {
          const priority = priorityMap[ticket.priority];
          if (!groups[priority]) {
            groups[priority] = [];
          }
          groups[priority].push(ticket);
          return groups;
        }, {});
      default:
        return {};
    }
  };

  // Sort tickets based on the selected criteria
  const sortTickets = (tickets, sortBy) => {
    return tickets.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;  
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);  
      }
      return 0;
    });
  };

  // Apply grouping and then sorting
  const groupedTickets = groupTickets(tickets, groupBy);

  return (
    <div className="App">
      <header className="App-header">

        {}
        <button className="display-button" onClick={() => setShowDropdown(!showDropdown)}>
          <img
            className="display-icon"
            src={`${process.env.PUBLIC_URL}/images/Display.svg`}
            alt="Display Options"
          />
          <span className="display-button-label">Display</span>  {}
        </button>

        {}
        {showDropdown && (
          <div className="dropdown">
            <h5>Grouping</h5>
            <select
              value={groupBy}
              onChange={(e) => handleGroupByChange(e.target.value)}
            >
              <option value="status">Status</option>
              <option value="user">User</option>
              <option value="priority">Priority</option>
            </select>

            <h5>Ordering</h5>
            <select
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value)}
            >
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        )}
      </header>

      <div className="kanban-board">
        {Object.keys(groupedTickets).map((group) => {
          // Sort the tickets within each group
          const sortedTickets = sortTickets(groupedTickets[group], sortBy);
          return (
            <div key={group} className="kanban-column">
              <h3>{group}</h3>

              {sortedTickets.map((ticket) => (
                <div key={ticket.id} className="kanban-card">
                  <h4>{ticket.id}</h4> {}
                  <h5>{ticket.title}</h5>

                  <div className="tags">
                    {ticket.tag.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              ))}

              <img
                className="add-card-btn"
                src={`${process.env.PUBLIC_URL}/images/add.svg`}
                alt="Add New Card"
                onClick={() => setShowModal(true)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          );
        })}
      </div>

      {/*Adding New Ticket */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Ticket</h3>
            <input
              type="text"
              placeholder="Ticket Title"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            />
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
            >
              <option value="4">Urgent</option>
              <option value="3">High</option>
              <option value="2">Medium</option>
              <option value="1">Low</option>
              <option value="0">No priority</option>
            </select>
            <select
              value={newTicket.status}
              onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
            >
              <option value="Todo">Todo</option>
              <option value="In progress">In progress</option>
              <option value="Backlog">Backlog</option>
            </select>
            <select
              value={newTicket.userId}
              onChange={(e) => setNewTicket({ ...newTicket, userId: e.target.value })}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button onClick={handleAddTicket}>Add Ticket</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
