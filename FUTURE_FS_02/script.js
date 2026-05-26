/**
 * FUTURE_FS_02 – Client Lead Management System (Mini CRM)
 * Frontend Client JavaScript Controller — Powered by LocalStorage
 * Developer: Matte Veera Venkata Manikanta
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  let state = {
    leads: [],
    loading: false,
    activeView: 'dashboard',
    searchQuery: '',
    statusFilter: 'All',
    editingLeadId: null,
    deletingLeadId: null
  };

  // ==========================================
  // 2. DOM SELECTORS
  // ==========================================
  // Navigation & Views
  const navItems = document.querySelectorAll('.nav-item');
  const contentViews = document.querySelectorAll('.content-view');
  const pageTitle = document.getElementById('page-title');
  const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
  const appSidebar = document.getElementById('app-sidebar');

  // Dashboard Stats Blocks
  const statsDeck = document.querySelector('.stats-deck');
  const dashboardSplit = document.querySelector('.dashboard-split');
  const dashboardEmptyCta = document.getElementById('dashboard-empty-cta');
  const dashboardAddBtn = document.getElementById('dashboard-add-btn');

  // Stats Counters
  const statTotal = document.getElementById('stat-total');
  const statContacted = document.getElementById('stat-contacted');
  const statConverted = document.getElementById('stat-converted');
  const statConversionPct = document.getElementById('stat-conversion-pct');

  // Funnel & Source Lists
  const funnelNewVal = document.getElementById('funnel-new-val');
  const funnelContactedVal = document.getElementById('funnel-contacted-val');
  const funnelConvertedVal = document.getElementById('funnel-converted-val');
  const funnelNewBar = document.querySelector('#funnel-new .funnel-bar');
  const funnelContactedBar = document.querySelector('#funnel-contacted .funnel-bar');
  const funnelConvertedBar = document.querySelector('#funnel-converted .funnel-bar');
  const sourceList = document.getElementById('source-list');

  // Filters & Controls
  const leadSearch = document.getElementById('lead-search');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const statusFilterSelect = document.getElementById('status-filter');
  const addLeadBtnTop = document.getElementById('add-lead-btn-top');
  const addLeadBtnControls = document.getElementById('add-lead-btn-controls');
  const emptyStateAddBtn = document.getElementById('empty-state-add-btn');

  // Loaders & Table Containers
  const leadsLoading = document.getElementById('leads-loading');
  const leadsEmptyState = document.getElementById('leads-empty-state');
  const leadsTable = document.getElementById('leads-table');
  const leadsTbody = document.getElementById('leads-tbody');
  const mobileLeadsList = document.getElementById('mobile-leads-list');

  // Lead Form Modal
  const leadModal = document.getElementById('lead-modal');
  const modalTitle = document.getElementById('modal-title');
  const leadForm = document.getElementById('lead-form');
  const leadIdInput = document.getElementById('lead-id');
  const leadNameInput = document.getElementById('lead-name');
  const leadEmailInput = document.getElementById('lead-email');
  const leadPhoneInput = document.getElementById('lead-phone');
  const leadSourceInput = document.getElementById('lead-source');
  const leadStatusSelect = document.getElementById('lead-status');
  const leadNotesInput = document.getElementById('lead-notes');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalSubmitText = document.getElementById('modal-submit-text');

  // Delete Dialog Modal
  const deleteModal = document.getElementById('delete-modal');
  const deleteLeadPreview = document.getElementById('delete-lead-preview');
  const deleteCancelBtn = document.getElementById('delete-cancel-btn');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

  // Toast container
  const toastContainer = document.getElementById('toast-container');

  // ==========================================
  // 3. TOAST NOTIFICATION ENGINE
  // ==========================================
  /**
   * Spawns a beautiful, modular glassmorphism toast notification
   * @param {string} title Toast Header Text
   * @param {string} desc Toast Subtitle Detail Description
   * @param {'success' | 'error' | 'warning' | 'info'} type Style Theme Class
   */
  function showToast(title, desc, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose correct Lucide icon name based on notification type
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'warning') iconName = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-body">
        <span class="toast-title">${title}</span>
        <span class="toast-desc">${desc}</span>
      </div>
      <button class="toast-close" aria-label="Dismiss toast">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
      </button>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons();

    // Attach click listener for explicit closure
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => dismissToast(toast));

    // Auto dismiss after 4 seconds
    setTimeout(() => dismissToast(toast), 4000);
  }

  function dismissToast(toast) {
    if (!toast.classList.contains('toast-exit')) {
      toast.classList.add('toast-exit');
      // Wait for slide-out transition
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }
  }

  // ==========================================
  // 4. NAVIGATION ROUTER & MOBILE DRAWER
  // ==========================================
  /**
   * Handles SPA view switching
   * @param {string} targetView Target ID name
   */
  function navigateTo(targetView) {
    state.activeView = targetView;

    // Toggle menu button selection
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === targetView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle active section views
    contentViews.forEach(view => {
      if (view.id === `view-${targetView}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Adjust Desktop Header Title based on active page
    if (targetView === 'dashboard') {
      pageTitle.textContent = 'Dashboard Overview';
    } else if (targetView === 'leads') {
      pageTitle.textContent = 'Leads Database';
    } else if (targetView === 'about') {
      pageTitle.textContent = 'About CRM Project';
    }

    // Close sidebar on mobile after navigating
    if (appSidebar.classList.contains('active')) {
      appSidebar.classList.remove('active');
    }
  }

  // Bind navigation triggers
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      navigateTo(view);
    });
  });

  // Mobile menu button toggler
  mobileSidebarToggle.addEventListener('click', () => {
    appSidebar.classList.toggle('active');
  });

  // Close sidebar drawer if clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      if (!appSidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target) && appSidebar.classList.contains('active')) {
        appSidebar.classList.remove('active');
      }
    }
  });

  // ==========================================
  // 5. LOCALSTORAGE DATABASE SERVICE WRAPPERS
  // ==========================================
  /**
   * Fetches lead list from browser LocalStorage and filters/searches in memory
   */
  function fetchLeads() {
    state.loading = true;
    toggleLoadingState(true);

    // Simulate minor visual network delay (200ms) for high-fidelity interactive feels
    setTimeout(() => {
      try {
        let allLeads = JSON.parse(localStorage.getItem('crm_leads'));
        
        // Seed mock data if completely empty on first load to wow the user immediately!
        if (!allLeads) {
          allLeads = [
            {
              _id: 'lead-mock-1',
              name: 'Arjun Sharma',
              email: 'arjun@example.com',
              phone: '+91 98765 43210',
              source: 'LinkedIn',
              status: 'New',
              notes: 'Interested in the premium enterprise tier. Requested demo call next Monday.',
              createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
            },
            {
              _id: 'lead-mock-2',
              name: 'Priya Patel',
              email: 'priya@techventures.io',
              phone: '+91 87654 32109',
              source: 'Referral',
              status: 'Contacted',
              notes: 'Completed discovery call. Needs customized brochure for her engineering team.',
              createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
            },
            {
              _id: 'lead-mock-3',
              name: 'Rahul Verma',
              email: 'rahul.verma@innovate.co',
              phone: '+91 76543 21098',
              source: 'Google',
              status: 'Converted',
              notes: 'Contract finalized. Loves the premium glassmorphism dark mode user experience!',
              createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
            }
          ];
          localStorage.setItem('crm_leads', JSON.stringify(allLeads));
        }

        // Apply filters in-memory
        let filteredLeads = allLeads;

        if (state.statusFilter !== 'All') {
          filteredLeads = filteredLeads.filter(lead => lead.status === state.statusFilter);
        }

        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filteredLeads = filteredLeads.filter(lead => {
            return (
              (lead.name && lead.name.toLowerCase().includes(query)) ||
              (lead.email && lead.email.toLowerCase().includes(query)) ||
              (lead.phone && lead.phone.toLowerCase().includes(query)) ||
              (lead.source && lead.source.toLowerCase().includes(query))
            );
          });
        }

        // Sort descending by creation date
        filteredLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        state.leads = filteredLeads;
        
        renderLeads();
        updateDashboardStats();

      } catch (error) {
        console.error('LocalStorage Retrieval Error:', error);
        showToast('Storage Error', 'Failed to retrieve lead data from browser memory.', 'error');
      } finally {
        state.loading = false;
        toggleLoadingState(false);
      }
    }, 200);
  }

  /**
   * Saves or edits client record directly inside browser LocalStorage
   * @param {Object} leadData Lead fields payload
   */
  function saveLead(leadData) {
    try {
      const allLeads = JSON.parse(localStorage.getItem('crm_leads')) || [];
      const isEditing = !!state.editingLeadId;

      if (isEditing) {
        // Edit record
        const index = allLeads.findIndex(l => l._id === state.editingLeadId);
        if (index !== -1) {
          leadData._id = state.editingLeadId;
          leadData.createdAt = allLeads[index].createdAt; // preserve creation date
          allLeads[index] = leadData;
        } else {
          throw new Error('Record could not be found in memory database.');
        }
      } else {
        // Create new record
        leadData._id = 'lead-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        leadData.createdAt = new Date().toISOString();
        allLeads.push(leadData);
      }

      // Save back to LocalStorage
      localStorage.setItem('crm_leads', JSON.stringify(allLeads));

      showToast(
        isEditing ? 'Lead Updated' : 'Lead Added Successfully',
        isEditing ? `Updated record details for ${leadData.name}.` : `Registered ${leadData.name} in LocalStorage registry.`,
        'success'
      );

      closeLeadModal();
      fetchLeads(); // Refresh database state synchronously

    } catch (error) {
      console.error('LocalStorage Save Error:', error);
      showToast('Transaction Failed', error.message, 'error');
    }
  }

  /**
   * Deletes a lead by ID from LocalStorage
   * @param {string} id Unique LocalStorage lead ID
   */
  function performDeleteLead(id) {
    try {
      let allLeads = JSON.parse(localStorage.getItem('crm_leads')) || [];
      const lead = allLeads.find(l => l._id === id);

      if (!lead) {
        throw new Error('Lead record does not exist.');
      }

      allLeads = allLeads.filter(l => l._id !== id);
      localStorage.setItem('crm_leads', JSON.stringify(allLeads));

      showToast('Lead Deleted', `Successfully scrubbed ${lead.name} from LocalStorage.`, 'success');
      closeDeleteModal();
      fetchLeads(); // Sync database state synchronously

    } catch (error) {
      console.error('LocalStorage Delete Error:', error);
      showToast('Deletion Failed', error.message, 'error');
    }
  }

  // ==========================================
  // 6. STATISTICS COUNTER ENGINE
  // ==========================================
  /**
   * Increments numbers smoothly on the screen
   * @param {HTMLElement} element DOM block
   * @param {number} target Final target limit
   * @param {number} duration animation in ms
   */
  function animateValue(element, target, duration = 600) {
    let startTimestamp = null;
    const startVal = parseInt(element.textContent, 10) || 0;
    
    if (startVal === target) {
      element.textContent = target;
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (Out-Quad)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * (target - startVal) + startVal);
      
      element.textContent = currentVal;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = target;
      }
    };
    
    window.requestAnimationFrame(step);
  }

  /**
   * Processes current list to calculate and animate dashboard widgets
   */
  function updateDashboardStats() {
    let allLeads = [];
    try {
      allLeads = JSON.parse(localStorage.getItem('crm_leads')) || [];
    } catch (e) {
      allLeads = state.leads;
    }

    const totalLeads = allLeads.length;

    // Toggle Empty Dashboard View beautifully
    if (totalLeads === 0) {
      statsDeck.style.display = 'none';
      dashboardSplit.style.display = 'none';
      dashboardEmptyCta.style.display = 'block';
      return;
    } else {
      statsDeck.style.display = 'grid';
      dashboardSplit.style.display = 'grid';
      dashboardEmptyCta.style.display = 'none';
    }

    const contactedLeads = allLeads.filter(l => l.status === 'Contacted').length;
    const convertedLeads = allLeads.filter(l => l.status === 'Converted').length;
    const newLeads = allLeads.filter(l => l.status === 'New').length;
    
    // Calculate conversions
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Render Stats values using animations
    animateValue(statTotal, totalLeads);
    animateValue(statContacted, contactedLeads);
    animateValue(statConverted, convertedLeads);

    statConversionPct.innerHTML = `<i data-lucide="sparkles" class="trend-icon"></i> ${conversionRate}% Success Rate`;
    lucide.createIcons();

    // 2. Funnel Visual Heights/Widths
    const newPct = Math.round((newLeads / totalLeads) * 100);
    const contactedPct = Math.round((contactedLeads / totalLeads) * 100);
    const convertedPct = Math.round((convertedLeads / totalLeads) * 100);

    funnelNewVal.textContent = newLeads;
    funnelContactedVal.textContent = contactedLeads;
    funnelConvertedVal.textContent = convertedLeads;

    funnelNewBar.style.width = `${Math.max(newPct, 8)}%`;
    funnelContactedBar.style.width = `${Math.max(contactedPct, 8)}%`;
    funnelConvertedBar.style.width = `${Math.max(convertedPct, 8)}%`;

    // 3. Lead Distribution by Source Graph Elements
    sourceList.innerHTML = '';
    
    // Compute Source occurrence frequencies
    const sourceCounts = {};
    allLeads.forEach(lead => {
      const src = lead.source || 'Unknown';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Color indices for visual accents
    const colors = [
      'hsl(330, 85%, 60%)', // Pink
      'hsl(270, 85%, 65%)', // Purple
      'hsl(200, 85%, 60%)', // Blue
      'hsl(40, 85%, 55%)',  // Amber
      'hsl(145, 75%, 55%)'  // Green
    ];

    Object.keys(sourceCounts)
      .sort((a, b) => sourceCounts[b] - sourceCounts[a]) // Sort descending
      .slice(0, 5) // Limit to top 5
      .forEach((source, index) => {
        const count = sourceCounts[source];
        const pct = Math.round((count / totalLeads) * 100);
        const color = colors[index % colors.length];

        const srcItem = document.createElement('div');
        srcItem.className = 'source-item';
        srcItem.innerHTML = `
          <div class="source-details">
            <span class="source-dot" style="background-color: ${color};"></span>
            <span class="source-name">${escapeHTML(source)}</span>
          </div>
          <div class="source-stat-block">
            <span class="source-count">${count}</span>
            <span class="source-percentage">${pct}%</span>
          </div>
        `;
        sourceList.appendChild(srcItem);
      });
  }

  // ==========================================
  // 7. LEADS RENDER LAYOUT
  // ==========================================
  /**
   * Helper to clean outputs from script injections
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  /**
   * Toggles loaders and layouts based on database loading flags
   * @param {boolean} active 
   */
  function toggleLoadingState(active) {
    if (active) {
      leadsLoading.style.display = 'flex';
      leadsTable.style.display = 'none';
      mobileLeadsList.style.display = 'none';
      leadsEmptyState.style.display = 'none';
    } else {
      leadsLoading.style.display = 'none';
    }
  }

  /**
   * Render state leads array in both Desktop tables and Mobile UI decks
   */
  function renderLeads() {
    leadsTbody.innerHTML = '';
    mobileLeadsList.innerHTML = '';

    if (state.leads.length === 0) {
      leadsEmptyState.style.display = 'flex';
      leadsTable.style.display = 'none';
      mobileLeadsList.style.display = 'none';
      return;
    }

    leadsEmptyState.style.display = 'none';
    
    // Desktop layout displays, mobile list handles media queries in CSS
    if (window.innerWidth <= 768) {
      mobileLeadsList.style.display = 'flex';
      leadsTable.style.display = 'none';
    } else {
      leadsTable.style.display = 'table';
      mobileLeadsList.style.display = 'none';
    }

    state.leads.forEach(lead => {
      // Formats Date nicely
      const createdDate = new Date(lead.createdAt);
      const dateString = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const escapedName = escapeHTML(lead.name);
      const escapedEmail = escapeHTML(lead.email);
      const escapedPhone = escapeHTML(lead.phone);
      const escapedSource = escapeHTML(lead.source);
      const escapedNotes = escapeHTML(lead.notes);

      // Create row for desktop table
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="lead-identity-cell">
            <span class="lead-name">${escapedName}</span>
            <span class="lead-email-sub">${escapedEmail}</span>
          </div>
        </td>
        <td>
          <div class="lead-contact-block">
            <span class="lead-phone">${escapedPhone}</span>
          </div>
        </td>
        <td>
          <span class="lead-source-badge">${escapedSource}</span>
        </td>
        <td>
          <span class="status-pill status-${lead.status.toLowerCase()}">${lead.status}</span>
        </td>
        <td>
          <div class="lead-notes-truncated" title="${escapedNotes}">${escapedNotes || 'No follow-up notes.'}</div>
        </td>
        <td>
          <span class="lead-timestamp">${dateString}</span>
        </td>
        <td>
          <div class="lead-actions-cell">
            <button class="btn-icon-table edit-lead-action" data-id="${lead._id}" aria-label="Edit Lead">
              <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="btn-icon-table btn-delete delete-lead-action" data-id="${lead._id}" aria-label="Delete Lead">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </td>
      `;

      leadsTbody.appendChild(tr);

      // Create responsive layout cards for mobile
      const card = document.createElement('div');
      card.className = 'mobile-lead-card';
      card.innerHTML = `
        <div class="mobile-card-row" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="mobile-card-details" style="display: flex; flex-direction: column;">
            <strong style="font-size: 1rem; color: var(--text-main);">${escapedName}</strong>
            <span class="status-pill status-${lead.status.toLowerCase()}" style="margin-top: 4px; width: fit-content;">${lead.status}</span>
          </div>
          <span class="lead-source-badge">${escapedSource}</span>
        </div>
        <div class="mobile-card-contact">
          <span><i data-lucide="mail" style="width: 12px; height: 12px; vertical-align: text-bottom; margin-right: 4px;"></i>${escapedEmail}</span>
          <span><i data-lucide="phone" style="width: 12px; height: 12px; vertical-align: text-bottom; margin-right: 4px;"></i>${escapedPhone}</span>
        </div>
        ${escapedNotes ? `<p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; border-left: 2px solid var(--border-glass); padding-left: 8px; margin-top: 4px;">${escapedNotes}</p>` : ''}
        <div class="mobile-card-row" style="font-size: 0.75rem; color: var(--text-faint); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 8px; margin-top: 4px;">
          <span>Registered: ${dateString}</span>
          <div class="mobile-card-actions" style="display: flex; gap: 8px;">
            <button class="btn btn-outline edit-lead-action" data-id="${lead._id}" style="padding: 5px 10px; font-size: 0.75rem; border-radius: 8px;">
              <i data-lucide="edit-3" style="width: 11px; height: 11px;"></i> Edit
            </button>
            <button class="btn btn-danger delete-lead-action" data-id="${lead._id}" style="padding: 5px 10px; font-size: 0.75rem; border-radius: 8px;">
              <i data-lucide="trash-2" style="width: 11px; height: 11px;"></i> Delete
            </button>
          </div>
        </div>
      `;

      mobileLeadsList.appendChild(card);
    });

    // Activate custom elements and icon mappings dynamically
    lucide.createIcons();

    // Attach CRUD Event Bindings to buttons
    document.querySelectorAll('.edit-lead-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        openEditLeadModal(id);
      });
    });

    document.querySelectorAll('.delete-lead-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        openDeleteConfirmationModal(id);
      });
    });
  }

  // Handle browser window resize to adapt layouts responsively
  window.addEventListener('resize', () => {
    if (state.leads.length > 0) {
      if (window.innerWidth <= 768 && mobileLeadsList.style.display !== 'flex') {
        renderLeads();
      } else if (window.innerWidth > 768 && leadsTable.style.display !== 'table') {
        renderLeads();
      }
    }
  });

  // ==========================================
  // 8. FORM VALIDATION & MODAL TRIGGERS
  // ==========================================
  /**
   * Opens modal in Create lead mode
   */
  function openCreateLeadModal() {
    state.editingLeadId = null;
    leadForm.reset();
    leadIdInput.value = '';
    
    // Clear validation outlines
    document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');

    modalTitle.textContent = 'Add New Client Lead';
    modalSubmitText.textContent = 'Create Lead';
    
    leadModal.classList.add('active');
  }

  /**
   * Opens modal in update lead mode populated with correct states
   * @param {string} id ID of client
   */
  function openEditLeadModal(id) {
    try {
      const allLeads = JSON.parse(localStorage.getItem('crm_leads')) || [];
      const lead = allLeads.find(l => l._id === id);
      if (!lead) return;

      state.editingLeadId = id;
      
      // Clear previous validations
      document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
      document.querySelectorAll('.error-message').forEach(err => err.textContent = '');

      // Populate input controls
      leadIdInput.value = lead._id;
      leadNameInput.value = lead.name;
      leadEmailInput.value = lead.email;
      leadPhoneInput.value = lead.phone;
      leadSourceInput.value = lead.source;
      leadStatusSelect.value = lead.status;
      leadNotesInput.value = lead.notes || '';

      modalTitle.textContent = 'Update Client Record';
      modalSubmitText.textContent = 'Save Changes';
      
      leadModal.classList.add('active');
    } catch (e) {
      console.error(e);
      showToast('Error', 'Could not open client record for editing.', 'error');
    }
  }

  function closeLeadModal() {
    leadModal.classList.remove('active');
    state.editingLeadId = null;
    leadForm.reset();
  }

  // Bind Form modal openers
  addLeadBtnTop.addEventListener('click', openCreateLeadModal);
  addLeadBtnControls.addEventListener('click', openCreateLeadModal);
  emptyStateAddBtn.addEventListener('click', openCreateLeadModal);
  if (dashboardAddBtn) {
    dashboardAddBtn.addEventListener('click', openCreateLeadModal);
  }

  modalCancelBtn.addEventListener('click', closeLeadModal);
  modalCloseBtn.addEventListener('click', closeLeadModal);

  // Client Side validation logic
  function validateForm() {
    let isValid = true;

    const name = leadNameInput.value.trim();
    const email = leadEmailInput.value.trim();
    const phone = leadPhoneInput.value.trim();
    const source = leadSourceInput.value.trim();

    // 1. Full name validation
    const nameGrp = leadNameInput.closest('.form-group');
    const nameErr = document.getElementById('error-lead-name');
    if (!name) {
      nameGrp.classList.add('has-error');
      nameErr.textContent = 'Full Name is required.';
      isValid = false;
    } else {
      nameGrp.classList.remove('has-error');
      nameErr.textContent = '';
    }

    // 2. Email Validation
    const emailGrp = leadEmailInput.closest('.form-group');
    const emailErr = document.getElementById('error-lead-email');
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email) {
      emailGrp.classList.add('has-error');
      emailErr.textContent = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      emailGrp.classList.add('has-error');
      emailErr.textContent = 'Please enter a valid email format.';
      isValid = false;
    } else {
      emailGrp.classList.remove('has-error');
      emailErr.textContent = '';
    }

    // 3. Phone validation
    const phoneGrp = leadPhoneInput.closest('.form-group');
    const phoneErr = document.getElementById('error-lead-phone');
    if (!phone) {
      phoneGrp.classList.add('has-error');
      phoneErr.textContent = 'Phone number is required.';
      isValid = false;
    } else {
      phoneGrp.classList.remove('has-error');
      phoneErr.textContent = '';
    }

    // 4. Source validation
    const sourceGrp = leadSourceInput.closest('.form-group');
    const sourceErr = document.getElementById('error-lead-source');
    if (!source) {
      sourceGrp.classList.add('has-error');
      sourceErr.textContent = 'Lead source designation is required.';
      isValid = false;
    } else {
      sourceGrp.classList.remove('has-error');
      sourceErr.textContent = '';
    }

    return isValid;
  }

  // Handle Form Submit Event
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Validation Error', 'Please check the required fields in the form.', 'warning');
      return;
    }

    const payload = {
      name: leadNameInput.value.trim(),
      email: leadEmailInput.value.trim(),
      phone: leadPhoneInput.value.trim(),
      source: sourceCapitalize(leadSourceInput.value.trim()),
      status: leadStatusSelect.value,
      notes: leadNotesInput.value.trim()
    };

    saveLead(payload);
  });

  // Capitalize source tags for cleaner visualization sorting
  function sourceCapitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==========================================
  // 9. DELETE CONFIRMATION DIALOG TRIGGERS
  // ==========================================
  function openDeleteConfirmationModal(id) {
    try {
      const allLeads = JSON.parse(localStorage.getItem('crm_leads')) || [];
      const lead = allLeads.find(l => l._id === id);
      if (!lead) return;

      state.deletingLeadId = id;
      
      // Populate preview card in delete dialog modal
      deleteLeadPreview.innerHTML = `
        <strong>${escapeHTML(lead.name)}</strong><br>
        <span style="font-size: 0.78rem; opacity: 0.7;">${escapeHTML(lead.email)}</span>
      `;

      deleteModal.classList.add('active');
    } catch (e) {
      console.error(e);
    }
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('active');
    state.deletingLeadId = null;
  }

  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteConfirmBtn.addEventListener('click', () => {
    if (state.deletingLeadId) {
      performDeleteLead(state.deletingLeadId);
    }
  });

  // ==========================================
  // 10. REAL-TIME SEARCH & STATUS FILTER
  // ==========================================
  // Real-time status filter handler
  statusFilterSelect.addEventListener('change', (e) => {
    state.statusFilter = e.target.value;
    fetchLeads(); // Fetch filtered lists from browser memory
  });

  // Debounced input search to optimize processing
  let searchDebounceTimer = null;
  leadSearch.addEventListener('input', (e) => {
    const val = e.target.value;
    state.searchQuery = val.trim();
    
    // Toggle clean search button indicator
    if (val.length > 0) {
      clearSearchBtn.style.display = 'flex';
    } else {
      clearSearchBtn.style.display = 'none';
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      fetchLeads();
    }, 150); // Small 150ms delay for ultra-smooth typing feedback
  });

  // Clear search field indicator
  clearSearchBtn.addEventListener('click', () => {
    leadSearch.value = '';
    state.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    fetchLeads();
  });

  // ==========================================
  // 11. INITIALIZATION ROUTINE
  // ==========================================
  function init() {
    // Force active routing links on refresh
    navigateTo('dashboard');
    
    // Synchronize initial collection data from browser storage
    fetchLeads();
  }

  // Start the application
  init();
});
