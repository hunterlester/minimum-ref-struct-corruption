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
  const contInfoArray = new ContainerInfoArray(accessContainerEntry.map((entry, index) => {
    global[`x${index}`] = ref.allocCString(entry.name);
    return new ContainerInfo({
      name: global[`x${index}`]
    });
  }));
  return new AccessContainerEntry({
    containers: contInfoArray.buffer
  });
};

const makeAuthGrantedFfiStruct = () => {
  return new AuthGranted({
	access_container_entry: makeAccessContainerEntry(accessContainerEntry)
  });
}

const authGranted = makeAuthGrantedFfiStruct();
const unNestedContainerEntry = makeAccessContainerEntry(accessContainerEntry);

if(global.gc) {
  console.log('Running garbage collection...');
  global.gc();
}

console.log('authGranted object afte gc: ', authGranted.access_container_entry.containers.deref());
console.log('Unnested access container entry after gc: ', unNestedContainerEntry.containers.deref());
console.log('Globally assigned values after gc: ', global.x0.toString(), global.x1.toString());
