import ContactRecord from 'Frontend/generated/com/example/application/services/CRMService/ContactRecord';
import React, {useEffect, useMemo, useState} from 'react';
import {CRMService} from "Frontend/generated/endpoints";
import {
    Grid,
    type GridDataProviderCallback,
    type GridDataProviderParams,
    type GridSorterDefinition
} from '@hilla/react-components/Grid.js';
import {GridColumn} from "@hilla/react-components/GridColumn";
import {HorizontalLayout} from "@hilla/react-components/HorizontalLayout";
import {VerticalLayout} from "@hilla/react-components/VerticalLayout";
import {TextField} from "@hilla/react-components/TextField";
import {FormLayout} from "@hilla/react-components/FormLayout";
import {EmailField} from "@hilla/react-components/EmailField";
import {Select} from "@hilla/react-components/Select";

export default function ContactsView() {

    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<ContactRecord | null>(null);
    const gridRef = React.useRef<any>(null);

    const statusRenderer = (person: ContactRecord) => (
        <span className={person.status === "Success" ? `success` : `error`}
        >
    {person.status}
  </span>
    );

    useEffect(() => {
        const grid = gridRef.current;
    }, []);

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
        [searchTerm]
    );

    const MyFormLayout = () => {
        if (!selected) {
            return (null);
        }
        const items = [
            {
                label: 'Success',
                value: 'Success',
            },
            {
                label: 'Error',
                value: 'Error',
            }
        ];
        return (
            <div style={{width:"50%"}}>
            <FormLayout>
                <TextField  label="First name" value={selected.firstName}></TextField>
                <TextField  label="Last name" value={selected.lastName}></TextField>
                <EmailField readonly label="Email" value={selected.email}></EmailField>
                <TextField label="Company name" value={selected.company.name}></TextField>
                <Select label="Status" value={selected.status} items={items}></Select>
            </FormLayout>
            </div>
        )
    }

    const LayoutWrapper = () => {
        return (
            <HorizontalLayout style={{width: "100%"}}>
                <Grid
                    ref={gridRef}
                    dataProvider={dataProvider}
                    onActiveItemChanged={(event) => {
                        if (!event.detail.value) {
                            setSelected(null);
                        } else if (selected === null) {
                            setSelected(event.detail.value);
                        } else if (selected.id == event.detail.value.id) {
                            setSelected(null);
                        } else {
                            setSelected(event.detail.value);
                        }


                    }}
                >
                    <GridColumn path="firstName"/>
                    <GridColumn path="lastName"/>
                    <GridColumn path="email"/>
                    <GridColumn path="company.name" header="Company name"/>
                    <GridColumn path="status"/>
                </Grid>
                <MyFormLayout/>
            </HorizontalLayout>
        )
    }

    return (
        <VerticalLayout>
            <h2>Contacts</h2>
            <LayoutWrapper/>

        </VerticalLayout>
    );
}
