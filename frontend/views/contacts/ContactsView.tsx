import ContactRecord from 'Frontend/generated/com/example/application/services/CRMService/ContactRecord';
import React, {useEffect, useMemo, useState} from 'react';
import {CRMService} from "Frontend/generated/endpoints";
import {
    Grid,
    type GridCellPartNameGenerator,
    type GridDataProviderCallback,
    type GridDataProviderParams,
    type GridSorterDefinition,
    type GridEventContext
} from '@hilla/react-components/Grid.js';
import {GridColumn} from "@hilla/react-components/GridColumn";
import {HorizontalLayout} from "@hilla/react-components/HorizontalLayout";
import {Avatar} from "@hilla/react-components/Avatar";
import {VerticalLayout} from "@hilla/react-components/VerticalLayout";
import {Notification} from "@hilla/react-components/Notification";
import {type ContextMenuElement, type ContextMenuRendererContext,} from '@hilla/react-components/ContextMenu.js';
import {ListBox} from "@hilla/react-components/ListBox";
import {Item} from "@hilla/react-components/Item";
import {Tooltip} from "@hilla/react-components/Tooltip";

export default function ContactsView() {

    const [contacts, setContacts] = useState<ContactRecord[]>([]);
    const [emailVisible, setEmailVisible] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<ContactRecord[]>([]);
    const [detailsOpenedItem, setDetailsOpenedItem] = useState<ContactRecord[]>([]);
    const gridRef = React.useRef<any>(null);

    const employeeRenderer = (person: ContactRecord) => (
        <HorizontalLayout style={{alignItems: 'center'}} theme="spacing">
            <Avatar
                img={`https://i.pravatar.cc/${person.id}`}
                name={`${person.firstName} ${person.lastName}`}
            />
            <VerticalLayout style={{lineHeight: 'var(--lumo-line-height-m)'}}>
                <span>{person.firstName} {person.lastName}</span>
                <span style={{
                    fontSize: 'var(--lumo-font-size-s)',
                    color: 'var(--lumo-secondary-text-color)'
                }}>{person.email}</span>
            </VerticalLayout>
        </HorizontalLayout>
    ); /* ... */

    const statusRenderer = (person: ContactRecord) => (
        <span className={person.status === "Success" ? `success` : `error`}
        >
    {person.status}
  </span>
    );

    useEffect(() => {
        CRMService.findAllContacts().then(setContacts);
        const grid = gridRef.current;
        if (grid) {
            // Workaround: Prevent opening context menu on header row.
            // @ts-expect-error vaadin-contextmenu isn't a GridElement event.
            grid.addEventListener('vaadin-contextmenu', (e) => {
                if (grid.getEventContext(e).section !== 'body') {
                    e.stopPropagation();
                }
            });
        }

    }, []);

    const footerElement = () => {
        return (<span>Some dynamic content: {Math.random()} </span>);
    }
    const headerElement = () => {
        return (<span>Some dynamic content: {Math.random()} </span>);
    }

    async function fetchContacts(params: {
        page: number;
        pageSize: number;
        searchTerm: string;
        sortOrders: GridSorterDefinition[];
    }) {
        const {page, pageSize, searchTerm, sortOrders} = params;
        const contactsResponse = await CRMService.fetchContacts(page, pageSize, searchTerm);
        return contactsResponse;
    }

    const dataProvider = useMemo(
        () =>
            async (
                params: GridDataProviderParams<ContactRecord>,
                callback: GridDataProviderCallback<ContactRecord>
            ) => {
                const {page, pageSize, sortOrders} = params;

                const {items, totalCount} = await fetchContacts({
                    page,
                    pageSize,
                    sortOrders,
                    searchTerm,
                });

                callback(items, totalCount);
            },
        [searchTerm] // (2)
    );

    const cellPartNameGenerator: GridCellPartNameGenerator<ContactRecord> = (column, model) => {
        const item = model.item;
        let parts = '';
        // Make the first name column bold
        // Add 'success' part to succesful status, 'error' to others
        parts += item.status === 'Success' ? ' success' : ' error';
        return parts;
    };

    function addTooltipToColumn(grid: any | null, column: number) {
        const sorter = grid?.getElementsByTagName('vaadin-grid-sorter')[column];
        sorter?.setAttribute('id', 'sorter');
        const tooltip = document.createElement('vaadin-tooltip');
        tooltip.setAttribute('for', 'sorter');
        tooltip.setAttribute('text', 'Sort by last name and first name');
        sorter?.parentElement?.appendChild(tooltip);
    }

    const StatusElement = () => {
        return <h2>Status</h2>;
    }

    const rowDetailsRenderer = ({item}: { item: ContactRecord }) => {
        return (
            <VerticalLayout>
                <h3>{item.firstName} {item.lastName}</h3>
                <p>{item.email}</p>
            </VerticalLayout>
        );
    }
    const contextMenu = ({context}: Readonly<{
        context: ContextMenuRendererContext;
        original: ContextMenuElement;
    }>) => {
        if (!gridRef.current) {
            return null;
        }
        const {sourceEvent} = context.detail as { sourceEvent: Event };
        const grid = gridRef.current;
        const eventContext = grid.getEventContext(sourceEvent);
        const contact = eventContext.item;
        const handleClick = (a: string) => () => {
            Notification.show(`Action ${a} for ${contact.firstName}`);
        }
        return (
            <ListBox>
                <Item onClick={handleClick('Edit')}>Edit</Item>
                <Item onClick={handleClick('Delete')}>Delete</Item>
                <Item onClick={handleClick('Email')}>Email {contact.email}</Item>
            </ListBox>
        );
    }
// ...
    const tooltipGenerator = (context: GridEventContext<ContactRecord>): string => {
        let text = '';
        const { column, item } = context;
        if ('firstName' === column?.path) {
            text = 'Full name: ' + item?.firstName + ' ' + item?.lastName;
        } else if ('status' === column?.path) {
            text = item?.status === 'Success' ? 'This person is a success' : '';
        }
        return text;
    }

    return (
        <VerticalLayout>
            <h2>Contacts</h2>
            <Grid ref={gridRef} dataProvider={dataProvider}
            >
                <GridColumn path="firstName"/>
                <GridColumn path="lastName"/>
                <GridColumn path="email"/>
                <GridColumn path="company.name" header="Company name"/>
                <GridColumn path="status" headerRenderer={StatusElement}/>
                <Tooltip slot="tooltip" generator={tooltipGenerator} />
            </Grid>

        </VerticalLayout>
    );
}
/*
            <TextField placeholder="Search" style={{width: '50%'}} onValueChanged={(e) => {
                setSearchTerm(e.detail.value.trim());
            }}></TextField>

     <GridColumn header="Status" >
                        {({ item }) => statusRenderer(item)}
                    </GridColumn>

                    <GridColumn header="Employee" flexGrow={0} autoWidth>
                        {({ item }) => employeeRenderer(item)}
                    </GridColumn>

 */