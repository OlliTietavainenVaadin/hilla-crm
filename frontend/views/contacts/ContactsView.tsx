import ContactRecord from 'Frontend/generated/com/example/application/services/CRMService/ContactRecord';
import React, {useEffect, useMemo, useState} from 'react';
import {CRMService} from "Frontend/generated/endpoints";
import {Grid, type GridCellPartNameGenerator } from '@hilla/react-components/Grid.js';
import {GridColumn} from "@hilla/react-components/GridColumn";
import {
    type GridDataProviderCallback,
    type GridDataProviderParams,
    type GridSorterDefinition,
} from '@hilla/react-components/Grid.js';
import {HorizontalLayout} from "@hilla/react-components/HorizontalLayout";
import {Avatar} from "@hilla/react-components/Avatar";
import {VerticalLayout} from "@hilla/react-components/VerticalLayout";
import {TextField} from "@hilla/react-components/TextField";
import {Notification} from "@hilla/react-components/Notification";
import {GridSelectionColumn} from "@hilla/react-components/GridSelectionColumn";
import {GridSortColumn} from "@hilla/react-components/GridSortColumn";
import {GridTreeColumn} from "@hilla/react-components/GridTreeColumn";

export default function ContactsView() {

    const [contacts, setContacts] = useState<ContactRecord[]>([]);
    const [emailVisible, setEmailVisible] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<ContactRecord[]>([]);

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
        setTimeout(() => {
            gridRef.current?.recalculateColumnWidths();
        }, 100);
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

    return (
        <VerticalLayout>
            <h2>Contacts</h2>
            <TextField placeholder="Search" style={{width: '50%'}} onValueChanged={(e) => {
                setSearchTerm(e.detail.value.trim());
            }}></TextField>
            <Grid itemHasChildrenPath="manager" dataProvider={dataProvider}>
                <GridTreeColumn path="firstName" />
                <GridColumn path="lastName"/>
                <GridColumn path="email"/>
                <GridColumn path="company.name" header="Company name"/>
                <GridColumn path="status" header="status"/>
            </Grid>
        </VerticalLayout>
    );
}
/*
     <GridColumn header="Status" >
                        {({ item }) => statusRenderer(item)}
                    </GridColumn>

                    <GridColumn header="Employee" flexGrow={0} autoWidth>
                        {({ item }) => employeeRenderer(item)}
                    </GridColumn>

 */