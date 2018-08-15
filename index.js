const ArrayType = require('ref-array');
const ref = require('ref');
const Struct = require('ref-struct');
const CString = ref.types.CString;

const ContainerInfo = Struct({
  name: CString
});

const ContainerInfoArray = new ArrayType(ContainerInfo);

const AccessContainerEntry = Struct({
  containers: ref.refType(ContainerInfo)
});

const AuthGranted = Struct({
  access_container_entry: AccessContainerEntry
});

const accessContainerEntry = [
  {
    "name": "apps/net.maidsafe.examples.mailtutorial",
  },
  {
    "name": "_publicNames",
  }
];

const makeAccessContainerEntry = (accessContainerEntry) => {
  const accessContainerEntryCache = {
    containerInfoArrayCache: null,
    containerInfoCaches: [],
  };
  accessContainerEntryCache.containerInfoArrayCache = new ContainerInfoArray(accessContainerEntry.map((entry, index) => {
    const name = ref.allocCString(entry.name);
    accessContainerEntryCache.containerInfoCaches.push(name);
    return new ContainerInfo({ name });
  }));
  return {
    accessContainerEntry: new AccessContainerEntry({
      containers: accessContainerEntryCache.containerInfoArrayCache.buffer,
    }),
    accessContainerEntryCache,
  };
};

const makeAuthGrantedFfiStruct = () => {
  const ace = makeAccessContainerEntry(accessContainerEntry);
  return {
    authGranted: new AuthGranted({
      access_container_entry: ace.accessContainerEntry,
    }),
    authGrantedCache: ace.accessContainerEntryCache,
  };
}

const authGranted = makeAuthGrantedFfiStruct();

if(global.gc) {
  console.log('Running garbage collection...');
  global.gc();
}

console.log('authGranted object afte gc: ', authGranted.authGranted.access_container_entry.containers.deref());
