import ContactRecord from 'Frontend/generated/com/example/application/services/CRMService/ContactRecord';
import {useEffect, useState} from 'react';
import {CRMService} from "Frontend/generated/endpoints";

export default function ContactsView() {

    const [contacts, setContacts] = useState<ContactRecord[]>([]);
    const [selected, setSelected] = useState<ContactRecord | null | undefined>();

    useEffect(() => {
        CRMService.findAllContacts().then(setContacts);
    }, []);

  return (
    <div className="p-m">
      <h2>Contacts</h2>
    </div>
  );
}
