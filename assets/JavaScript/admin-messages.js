//===============================================
//          TRENDSPHERE ADMIN MESSAGES
//===============================================


//===============================================
//          ELEMENTS
//===============================================

const adminStatus =
    document.getElementById(
        "admin-status"
    );

const messagesContainer =
    document.getElementById(
        "messages-container"
    );

const totalMessages =
    document.getElementById(
        "total-messages"
    );

const unreadMessages =
    document.getElementById(
        "unread-messages"
    );


//===============================================
//          CHECK SUPABASE
//===============================================

function isAdminSupabaseReady(){

    return (
        typeof supabaseClient !==
            "undefined" &&
        supabaseClient &&
        supabaseClient.auth
    );

}


//===============================================
//          GET CURRENT USER
//===============================================

async function getAdminUser(){

    if(
        !isAdminSupabaseReady()
    ){

        return null;

    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if(error){

            console.error(
                "Session error:",
                error
            );

            return null;

        }


        return (
            data?.session?.user ||
            null
        );

    }
    catch(error){

        console.error(
            "Admin user error:",
            error
        );

        return null;

    }

}


//===============================================
//          CHECK ADMIN STATUS
//===============================================

async function checkAdminAccess(){

    const user =
        await getAdminUser();


    if(!user){

        return false;

    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "admin_users"
                )
                .select(
                    "user_id"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();


        if(error){

            console.error(
                "Admin access check error:",
                error
            );

            return false;

        }


        return !!data;

    }
    catch(error){

        console.error(
            "Admin access check failed:",
            error
        );

        return false;

    }

}


//===============================================
//          SHOW ACCESS DENIED
//===============================================

function showAccessDenied(){

    if(adminStatus){

        adminStatus.className =
            "admin-status error";

        adminStatus.innerHTML = `

            <i class="bx bx-lock-alt"></i>

            <strong>
                Access Denied
            </strong>

            <p>
                You do not have permission to access
                the TrendSphere admin area.
            </p>

        `;

    }


    if(messagesContainer){

        messagesContainer.innerHTML =
            "";

    }

}


//===============================================
//          FORMAT MESSAGE DATE
//===============================================

function formatMessageDate(
    date
){

    if(!date){

        return "";

    }


    return new Date(
        date
    ).toLocaleString();

}


//===============================================
//          LOAD MESSAGES
//===============================================

async function loadContactMessages(){

    const allowed =
        await checkAdminAccess();


    if(!allowed){

        showAccessDenied();

        return;

    }


    if(adminStatus){

        adminStatus.className =
            "admin-status success";

        adminStatus.innerHTML = `

            <i class="bx bx-check-circle"></i>

            <strong>
                Administrator Access
            </strong>

            <p>
                You can manage TrendSphere contact messages.
            </p>

        `;

    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "contact_messages"
                )
                .select(`
                    id,
                    name,
                    email,
                    subject,
                    message,
                    created_at,
                    is_read
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if(error){

            console.error(
                "Unable to load messages:",
                error
            );

            messagesContainer.innerHTML = `

                <div class="admin-empty">

                    <i class="bx bx-error-circle"></i>

                    <h2>
                        Unable to load messages
                    </h2>

                    <p>
                        Please try again.
                    </p>

                </div>

            `;

            return;

        }


        const messages =
            data || [];


        updateStatistics(
            messages
        );


        displayMessages(
            messages
        );

    }
    catch(error){

        console.error(
            "Admin message loading error:",
            error
        );

    }

}


//===============================================
//          UPDATE STATISTICS
//===============================================

function updateStatistics(
    messages
){

    if(totalMessages){

        totalMessages.textContent =
            messages.length;

    }


    if(unreadMessages){

        unreadMessages.textContent =
            messages.filter(
                message =>
                    !message.is_read
            ).length;

    }

}


//===============================================
//          DISPLAY MESSAGES
//===============================================

function displayMessages(
    messages
){

    if(
        !messagesContainer
    ){

        return;

    }


    if(!messages.length){

        messagesContainer.innerHTML = `

            <div class="admin-empty">

                <i class="bx bx-envelope-open"></i>

                <h2>
                    No Contact Messages
                </h2>

                <p>
                    Messages submitted through the
                    Contact page will appear here.
                </p>

            </div>

        `;

        return;

    }


    messagesContainer.innerHTML =
        "";


    messages.forEach(
        message => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "admin-message-card";


            if(!message.is_read){

                card.classList.add(
                    "unread"
                );

            }


            card.innerHTML = `

                <div class="admin-message-header">

                    <div>

                        <span
                            class="admin-message-status"
                        >

                            ${
                                message.is_read
                                    ? "Read"
                                    : "Unread"
                            }

                        </span>


                        <h2>
                            ${
                                message.subject ||
                                "No Subject"
                            }
                        </h2>

                    </div>


                    <small>

                        ${formatMessageDate(
                            message.created_at
                        )}

                    </small>

                </div>


                <div class="admin-message-meta">

                    <strong>
                        ${
                            message.name ||
                            "Unknown"
                        }
                    </strong>


                    <a
                        href="mailto:${message.email}"
                    >

                        ${
                            message.email
                        }

                    </a>

                </div>


                <div class="admin-message-body">

                    <p>
                        ${
                            message.message
                        }
                    </p>

                </div>


                <div class="admin-message-actions">

                    ${
                        !message.is_read
                            ? `
                                <button
                                    type="button"
                                    class="mark-message-read"
                                    data-id="${message.id}"
                                >
                                    <i class="bx bx-check"></i>
                                    Mark as Read
                                </button>
                              `
                            : ""
                    }


                    <button
                        type="button"
                        class="delete-message"
                        data-id="${message.id}"
                    >

                        <i class="bx bx-trash"></i>

                        Delete

                    </button>

                </div>

            `;


            messagesContainer.appendChild(
                card
            );

        }
    );


    attachMessageEvents();

}


//===============================================
//          ATTACH MESSAGE EVENTS
//===============================================

function attachMessageEvents(){

    document
        .querySelectorAll(
            ".mark-message-read"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        await markMessageAsRead(
                            id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".delete-message"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        const confirmed =
                            confirm(
                                "Delete this contact message?"
                            );


                        if(!confirmed){

                            return;

                        }


                        await deleteContactMessage(
                            id
                        );

                    }
                );

            }
        );

}


//===============================================
//          MARK MESSAGE AS READ
//===============================================

async function markMessageAsRead(
    id
){

    const {
        error
    } =
        await supabaseClient
            .from(
                "contact_messages"
            )
            .update({

                is_read:
                    true

            })
            .eq(
                "id",
                id
            );


    if(error){

        console.error(
            "Mark message read error:",
            error
        );

        return;

    }


    await loadContactMessages();

}


//===============================================
//          DELETE CONTACT MESSAGE
//===============================================

async function deleteContactMessage(
    id
){

    const {
        error
    } =
        await supabaseClient
            .from(
                "contact_messages"
            )
            .delete()
            .eq(
                "id",
                id
            );


    if(error){

        console.error(
            "Delete message error:",
            error
        );

        return;

    }


    await loadContactMessages();

}


//===============================================
//          INITIAL LOAD
//===============================================

loadContactMessages();